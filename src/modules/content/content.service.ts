import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { Content, ContentStatus, ContentType } from './entities/content.entity';
import { ContentVersion } from './entities/content-version.entity';
import { ContentMetadata } from './entities/content-metadata.entity';
import { ContentRepository } from './content.repository';
import { UploadContentDto } from './dto/upload-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { QueueService } from '@common/queue/queue.service';
import { CloudinaryService } from '@common/cloudinary/cloudinary.service';
import { QUEUE_CONTENT_UPLOAD, QUEUE_VIDEO_TRANSCODE } from '@common/queue/queue.constants';
import { checksumSha256 } from '@common/utils/hash.util';
import { Organization } from '@modules/organization/entities/organization.entity';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly configService: ConfigService,
    private readonly queueService: QueueService,
    private readonly cloudinaryService: CloudinaryService,
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
    @InjectRepository(ContentVersion)
    private readonly versionRepo: Repository<ContentVersion>,
    @InjectRepository(ContentMetadata)
    private readonly metadataRepo: Repository<ContentMetadata>,
    private readonly dataSource: DataSource,
  ) {}

  private getCloudinaryResourceType(contentType: ContentType): 'image' | 'video' | 'raw' {
    switch (contentType) {
      case ContentType.IMAGE:
      case ContentType.DOCUMENT:
      case ContentType.EBOOK:
        return 'image';
      case ContentType.VIDEO:
      case ContentType.AUDIO:
        return 'video';
      default:
        return 'raw';
    }
  }

  async uploadContent(
    file: Express.Multer.File,
    dto: UploadContentDto,
    userId: string,
    orgId: string,
  ): Promise<Content> {
    const checksum = checksumSha256(file.buffer);
    
    // Ensure orgId is present. If user is Super Admin (orgId is null), use or create a default organization.
    let finalOrgId = orgId;
    if (!finalOrgId || finalOrgId === 'null') {
      const orgRepo = this.dataSource.getRepository(Organization);
      let defaultOrg = await orgRepo.findOne({ where: {} });
      if (!defaultOrg) {
        defaultOrg = orgRepo.create({
          name: 'Default System Organization',
          slug: 'default-system-organization',
          plan: 'enterprise',
          settings: {},
        });
        defaultOrg = await orgRepo.save(defaultOrg);
      }
      finalOrgId = defaultOrg.id;
    }

    const folderPrefix = (dto.contentType === ContentType.DOCUMENT || dto.contentType === ContentType.EBOOK) ? 'docs' : 'raw';
    let publicId = `${folderPrefix}/${finalOrgId}/${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}`;
    const resourceType = this.getCloudinaryResourceType(dto.contentType);

    // Upload to Cloudinary
    try {
      const uploadResult = await this.cloudinaryService.uploadFile(
        file.buffer,
        `${folderPrefix}/${finalOrgId}`,
        resourceType,
        file.originalname,
      );
      publicId = uploadResult.publicId;
    } catch (error) {
      this.logger.error(`Cloudinary Upload failed for: ${file.originalname}`, error.stack);
    }

    // Create DB content
    const content = this.contentRepo.create({
      organizationId: finalOrgId,
      createdBy: userId,
      title: dto.title,
      description: dto.description || null,
      contentType: dto.contentType,
      status: ContentStatus.PROCESSING,
      s3Key: publicId,
      s3Bucket: 'cloudinary',
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
      s3Key: publicId,
      fileSize: file.size,
      checksumSha256: checksum,
      changeNote: 'Initial Upload',
      createdBy: userId,
    });
    await this.versionRepo.save(version);

    // Dispatch PgBoss Job
    await this.queueService.publish(QUEUE_CONTENT_UPLOAD, {
      contentId: savedContent.id,
      s3Key: publicId,
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
      .orderBy('content.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (orgId && orgId !== 'null') {
      qb.where('content.organizationId = :orgId', { orgId });
    }

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
    if (orgId && orgId !== 'null') {
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
    const versionOrgId = content.organizationId || 'default-org-fallback';
    const folderPrefix = (content.contentType === ContentType.DOCUMENT || content.contentType === ContentType.EBOOK) ? 'docs' : 'raw';
    let publicId = `${folderPrefix}/${versionOrgId}/${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}`;
    const resourceType = this.getCloudinaryResourceType(content.contentType);

    try {
      const uploadResult = await this.cloudinaryService.uploadFile(
        file.buffer,
        `${folderPrefix}/${versionOrgId}`,
        resourceType,
        file.originalname,
      );
      publicId = uploadResult.publicId;
    } catch (error) {
      this.logger.error(`Cloudinary Upload failed for: ${file.originalname}`, error.stack);
    }

    const nextVer = content.currentVersion + 1;
    content.currentVersion = nextVer;
    content.s3Key = publicId;
    content.fileSize = file.size;
    content.mimeType = file.mimetype;
    content.checksumSha256 = checksum;
    content.status = ContentStatus.PROCESSING;
    await this.contentRepo.save(content);

    const version = this.versionRepo.create({
      contentId: content.id,
      versionNumber: nextVer,
      s3Key: publicId,
      fileSize: file.size,
      checksumSha256: checksum,
      changeNote: note || `Version ${nextVer}`,
      createdBy: userId,
    });

    const savedVersion = await this.versionRepo.save(version);

    await this.queueService.publish(QUEUE_CONTENT_UPLOAD, {
      contentId: content.id,
      s3Key: publicId,
      contentType: content.contentType,
    });

    return savedVersion;
  }
}
