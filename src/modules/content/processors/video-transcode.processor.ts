import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { QueueService } from '@common/queue/queue.service';
import { QUEUE_VIDEO_TRANSCODE, QUEUE_THUMBNAIL_GENERATE } from '@common/queue/queue.constants';
import { ContentRepository } from '../content.repository';
import { ContentStatus } from '../entities/content.entity';

@Injectable()
export class VideoTranscodeProcessor implements OnModuleInit {
  private readonly logger = new Logger(VideoTranscodeProcessor.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly contentRepository: ContentRepository,
  ) {}

  async onModuleInit() {
    await this.queueService.subscribe(QUEUE_VIDEO_TRANSCODE, async (job) => {
      const { contentId, s3Key } = job.data;
      this.logger.log(`Transcoding video content: ${contentId}`);

      try {
        const content = await this.contentRepository.base.findOne({ where: { id: contentId } });
        if (!content) {
          this.logger.error(`Content not found: ${contentId}`);
          return;
        }

        // Mock FFmpeg transcoding execution block
        // In production, you would run ffmpeg command-line tools to generate ABR HLS segments
        this.logger.log(`Generating adaptive bitrate HLS streams for: ${s3Key}`);
        
        await new Promise((resolve) => setTimeout(resolve, 2000)); // simulate transcoding duration

        content.status = ContentStatus.PUBLISHED;
        content.publishedAt = new Date();
        await this.contentRepository.base.save(content);

        this.logger.log(`Video transcoding completed successfully for: ${contentId}`);

        // Generate poster thumbnail
        await this.queueService.publish(QUEUE_THUMBNAIL_GENERATE, { contentId, s3Key });
      } catch (error) {
        this.logger.error(`Video transcoding failed for: ${contentId}`, error.stack);
        await this.contentRepository.base.update({ id: contentId }, { status: ContentStatus.FAILED });
      }
    });
  }
}
