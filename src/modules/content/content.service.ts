import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

import { Content, ContentStatus, ContentType } from './entities/content.entity';
import { ContentVersion } from './entities/content-version.entity';
import { ContentMetadata } from './entities/content-metadata.entity';
import { ContentRepository } from './content.repository';
import { UploadContentDto } from './dto/upload-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { QueueService } from '@common/queue/queue.service';
import { QUEUE_CONTENT_UPLOAD, QUEUE_VIDEO_TRANSCODE } from '@common/queue/queue.constants';
import { checksumSha256 } from '@common/utils/hash.util';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);
  private s3Client: S3Client;
  private rawBucket: string;

  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly configService: ConfigService,
    private readonly queueService: QueueService,
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
    @InjectRepository(ContentVersion)
    private readonly versionRepo: Repository<ContentVersion>,
    @InjectRepository(ContentMetadata)
    private readonly metadataRepo: Repository<ContentMetadata>,
  ) {
    this.rawBucket = this.configService.get<string>('S3_BUCKET_RAW', 'drms-raw-content');
    this.s3Client = new S3Client({
      endpoint: this.configService.get<string>('S3_ENDPOINT', 'http://localhost:9000'),
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY', 'minioadmin'),
        secretAccessKey: this.configService.get<string>('S3_SECRET_KEY', 'minioadmin'),
      },
      region: this.configService.get<string>('S3_REGION', 'us-east-1'),
      forcePathStyle: this.configService.get<boolean>('S3_FORCE_PATH_STYLE', true),
    });
  }

  async uploadContent(
    file: Express.Multer.File,
    dto: UploadContentDto,
    userId: string,
    orgId: string,
  ): Promise<Content> {
    const checksum = checksumSha256(file.buffer);
    const s3Key = `raw/${orgId}/${Date.now()}-${file.originalname}`;

    // Upload to S3
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.rawBucket,
          Key: s3Key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
    } catch (error) {
      this.logger.error(`S3 Upload failed for key: ${s3Key}`, error.stack);
      // Fallback/log warning for offline development
    }

    // Create DB content
    const content = this.contentRepo.create({
      organizationId: orgId,
      createdBy: userId,
      title: dto.title,
      description: dto.description || null,
      contentType: dto.contentType,
      status: ContentStatus.PROCESSING,
      s3Key,
      s3Bucket: this.rawBucket,
      fileSize: file.size,
      mimeType: file.mimetype,
      checksumSha256: checksum,
      isEncrypted: false,
      drmConfig: dto.metadata ? JSON.parse(JSON.stringify(dto.metadata)) : {},
    });

    const savedContent = await this.contentRepo.save(content);

    // Create Content Version
    const version = this.versionRepo.create({
      contentId: savedContent.id,
      versionNumber: 1,
      s3Key,
      fileSize: file.size,
      checksumSha256: checksum,
      changeNote: 'Initial Upload',
      createdBy: userId,
    });
    await this.versionRepo.save(version);

    // Dispatch PgBoss Job
    await this.queueService.publish(QUEUE_CONTENT_UPLOAD, {
      contentId: savedContent.id,
      s3Key,
      contentType: dto.contentType,
    });

    return savedContent;
  }

  async findAll(
    orgId: string,
    page: number = 1,
    limit: number = 20,
    filters?: { status?: ContentStatus; contentType?: ContentType; search?: string },
  ): Promise<{ items: Content[]; total: number }> {
    const qb = this.contentRepo.createQueryBuilder('content')
      .where('content.organizationId = :orgId', { orgId })
      .orderBy('content.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filters?.status) {
      qb.andWhere('content.status = :status', { status: filters.status });
    }
    if (filters?.contentType) {
      qb.andWhere('content.contentType = :contentType', { contentType: filters.contentType });
    }
    if (filters?.search) {
      qb.andWhere(
        '(content.title ILIKE :search OR content.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async findById(id: string, orgId?: string): Promise<Content> {
    const where: any = { id };
    if (orgId) {
      where.organizationId = orgId;
    }
    const content = await this.contentRepo.findOne({
      where,
      relations: ['versions', 'metadataEntries'],
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }
    return content;
  }

  async updateMetadata(id: string, dto: UpdateContentDto, orgId: string): Promise<Content> {
    const content = await this.findById(id, orgId);
    Object.assign(content, dto);
    return this.contentRepo.save(content);
  }

  async deleteContent(id: string, orgId: string): Promise<void> {
    const content = await this.findById(id, orgId);
    content.status = ContentStatus.ARCHIVED;
    await this.contentRepo.save(content);
  }

  async publishContent(id: string, orgId: string): Promise<Content> {
    const content = await this.findById(id, orgId);
    if (content.status !== ContentStatus.PROCESSING && content.status !== ContentStatus.DRAFT) {
      throw new BadRequestException('Content cannot be published from its current status');
    }
    content.status = ContentStatus.PUBLISHED;
    content.publishedAt = new Date();
    return this.contentRepo.save(content);
  }

  async archiveContent(id: string, orgId: string): Promise<Content> {
    const content = await this.findById(id, orgId);
    content.status = ContentStatus.ARCHIVED;
    return this.contentRepo.save(content);
  }

  async getVersions(id: string, orgId: string): Promise<ContentVersion[]> {
    await this.findById(id, orgId);
    return this.versionRepo.find({
      where: { contentId: id },
      order: { versionNumber: 'DESC' },
    });
  }

  async createVersion(
    id: string,
    file: Express.Multer.File,
    note: string,
    userId: string,
    orgId: string,
  ): Promise<ContentVersion> {
    const content = await this.findById(id, orgId);
    const checksum = checksumSha256(file.buffer);
    const s3Key = `raw/${orgId}/${Date.now()}-${file.originalname}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.rawBucket,
          Key: s3Key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
    } catch (error) {
      this.logger.error(`S3 Upload failed for key: ${s3Key}`, error.stack);
    }

    const nextVer = content.currentVersion + 1;
    content.currentVersion = nextVer;
    content.s3Key = s3Key;
    content.fileSize = file.size;
    content.mimeType = file.mimetype;
    content.checksumSha256 = checksum;
    content.status = ContentStatus.PROCESSING;
    await this.contentRepo.save(content);

    const version = this.versionRepo.create({
      contentId: content.id,
      versionNumber: nextVer,
      s3Key,
      fileSize: file.size,
      checksumSha256: checksum,
      changeNote: note || `Version ${nextVer}`,
      createdBy: userId,
    });

    const savedVersion = await this.versionRepo.save(version);

    await this.queueService.publish(QUEUE_CONTENT_UPLOAD, {
      contentId: content.id,
      s3Key,
      contentType: content.contentType,
    });

    return savedVersion;
  }
}
