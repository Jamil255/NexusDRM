import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { QueueService } from '@common/queue/queue.service';
import { QUEUE_THUMBNAIL_GENERATE } from '@common/queue/queue.constants';
import { ContentRepository } from '../content.repository';
import { CloudinaryService } from '@common/cloudinary/cloudinary.service';

@Injectable()
export class ThumbnailGeneratorProcessor implements OnModuleInit {
  private readonly logger = new Logger(ThumbnailGeneratorProcessor.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly contentRepository: ContentRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async onModuleInit() {
    await this.queueService.subscribe(QUEUE_THUMBNAIL_GENERATE, async (job) => {
      const { contentId, s3Key } = job.data;
      this.logger.log(`Generating thumbnail for content: ${contentId}`);

      try {
        const content = await this.contentRepository.base.findOne({ where: { id: contentId } });
        if (!content) {
          this.logger.error(`Content not found: ${contentId}`);
          return;
        }

        // Determine Cloudinary resource type from content type
        let resourceType: 'image' | 'video' | 'raw' = 'raw';
        if (content.contentType === 'video' || content.contentType === 'audio') {
          resourceType = 'video';
        } else if (content.contentType === 'image' || content.contentType === 'document' || content.contentType === 'ebook') {
          resourceType = 'image';
        }

        // Generate thumbnail URL via Cloudinary URL transformations
        // - Video: auto-selects the best frame (so_auto)
        // - Image: crops/resizes to thumbnail dimensions
        // - Document (PDF): renders first page as image
        const thumbnailUrl = this.cloudinaryService.generateThumbnailUrl(
          s3Key,
          resourceType,
          400,
          300,
        );

        // Also generate a small preview for grid views
        const previewUrl = this.cloudinaryService.generateThumbnailUrl(
          s3Key,
          resourceType,
          160,
          120,
        );

        content.metadata = {
          ...content.metadata,
          thumbnailUrl,
          previewUrl,
          thumbnailGeneratedAt: new Date().toISOString(),
        };
        await this.contentRepository.base.save(content);

        this.logger.log(`Thumbnail generated successfully for: ${contentId} → ${thumbnailUrl}`);
      } catch (error) {
        this.logger.error(`Failed to generate thumbnail for content: ${contentId}`, error.stack);
      }
    });
  }
}
