import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { QueueService } from '@common/queue/queue.service';
import { QUEUE_CONTENT_UPLOAD, QUEUE_VIDEO_TRANSCODE, QUEUE_THUMBNAIL_GENERATE } from '@common/queue/queue.constants';
import { ContentRepository } from '../content.repository';
import { ContentStatus, ContentType } from '../entities/content.entity';

@Injectable()
export class ContentUploadProcessor implements OnModuleInit {
  private readonly logger = new Logger(ContentUploadProcessor.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly contentRepository: ContentRepository,
  ) {}

  async onModuleInit() {
    await this.queueService.subscribe(QUEUE_CONTENT_UPLOAD, async (job) => {
      const { contentId, s3Key, contentType } = job.data;
      this.logger.log(`Processing uploaded content: ${contentId}`);

      try {
        const content = await this.contentRepository.base.findOne({ where: { id: contentId } });
        if (!content) {
          this.logger.error(`Content not found: ${contentId}`);
          return;
        }

        // Trigger further asynchronous tasks depending on content type
        if (contentType === ContentType.VIDEO) {
          await this.queueService.publish(QUEUE_VIDEO_TRANSCODE, { contentId, s3Key });
        } else {
          // Trigger thumbnail generation for non-video content
          await this.queueService.publish(QUEUE_THUMBNAIL_GENERATE, { contentId, s3Key });
          
          content.status = ContentStatus.PUBLISHED;
          content.publishedAt = new Date();
          await this.contentRepository.base.save(content);
          this.logger.log(`Content ${contentId} successfully published`);
        }
      } catch (error) {
        this.logger.error(`Failed to process content upload: ${contentId}`, error.stack);
        await this.contentRepository.base.update({ id: contentId }, { status: ContentStatus.FAILED });
      }
    });
  }
}
