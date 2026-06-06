import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { QueueService } from '@common/queue/queue.service';
import { QUEUE_THUMBNAIL_GENERATE } from '@common/queue/queue.constants';
import { ContentRepository } from '../content.repository';

@Injectable()
export class ThumbnailGeneratorProcessor implements OnModuleInit {
  private readonly logger = new Logger(ThumbnailGeneratorProcessor.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly contentRepository: ContentRepository,
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

        // Mock thumbnail generation block
        this.logger.log(`Extracting frame / rendering preview for S3 asset: ${s3Key}`);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // simulate thumbnail creation

        const thumbnailUrl = `https://drms-thumbnails.s3.amazonaws.com/previews/${contentId}.png`;
        content.metadata = { ...content.metadata, thumbnailUrl };
        await this.contentRepository.base.save(content);

        this.logger.log(`Thumbnail generated successfully for: ${contentId}`);
      } catch (error) {
        this.logger.error(`Failed to generate thumbnail for content: ${contentId}`, error.stack);
      }
    });
  }
}
