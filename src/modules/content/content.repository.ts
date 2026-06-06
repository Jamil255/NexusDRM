import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content, ContentStatus } from './entities/content.entity';
import { ContentVersion } from './entities/content-version.entity';
import { ContentMetadata } from './entities/content-metadata.entity';

@Injectable()
export class ContentRepository {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
    @InjectRepository(ContentVersion)
    private readonly versionRepo: Repository<ContentVersion>,
    @InjectRepository(ContentMetadata)
    private readonly metadataRepo: Repository<ContentMetadata>,
  ) {}

  get base(): Repository<Content> {
    return this.contentRepo;
  }

  get versionBase(): Repository<ContentVersion> {
    return this.versionRepo;
  }

  get metadataBase(): Repository<ContentMetadata> {
    return this.metadataRepo;
  }

  async findByOrganization(orgId: string): Promise<Content[]> {
    return this.contentRepo.find({ where: { organizationId: orgId } });
  }

  async countByStatus(orgId: string, status: ContentStatus): Promise<number> {
    return this.contentRepo.count({ where: { organizationId: orgId, status } });
  }
}
