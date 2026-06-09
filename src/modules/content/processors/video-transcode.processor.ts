import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { QueueService } from '@common/queue/queue.service';
import { QUEUE_VIDEO_TRANSCODE, QUEUE_THUMBNAIL_GENERATE } from '@common/queue/queue.constants';
import { ContentRepository } from '../content.repository';
import { ContentStatus } from '../entities/content.entity';
import { CloudinaryService } from '@common/cloudinary/cloudinary.service';

@Injectable()
export class VideoTranscodeProcessor implements OnModuleInit {
  private readonly logger = new Logger(VideoTranscodeProcessor.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly contentRepository: ContentRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async onModuleInit() {
    await this.queueService.subscribe(QUEUE_VIDEO_TRANSCODE, async (job) => {
      const { contentId, s3Key } = job.data;
      this.logger.log(`Processing video transcoding for content: ${contentId}`);

      try {
        const content = await this.contentRepository.base.findOne({ where: { id: contentId } });
        if (!content) {
          this.logger.error(`Content not found: ${contentId}`);
          return;
        }

        // Generate HLS streaming URL using Cloudinary's streaming profile
        const hlsUrl = this.cloudinaryService.getHlsStreamingUrl(s3Key);
        this.logger.log(`HLS adaptive bitrate stream generated: ${hlsUrl}`);

        // Generate thumbnail using Cloudinary URL transformation (auto-frame for video)
        const thumbnailUrl = this.cloudinaryService.generateThumbnailUrl(s3Key, 'video', 640, 360);
        this.logger.log(`Video poster frame generated: ${thumbnailUrl}`);

        // Update content metadata with transcoding results
        content.metadata = {
          ...content.metadata,
          hlsUrl,
          thumbnailUrl,
          transcodedAt: new Date().toISOString(),
          streamingProfile: 'hd',
        };
        content.status = ContentStatus.PUBLISHED;
        content.publishedAt = new Date();
        await this.contentRepository.base.save(content);

        this.logger.log(`Video transcoding completed successfully for: ${contentId}`);

        // Trigger thumbnail persistence job
        await this.queueService.publish(QUEUE_THUMBNAIL_GENERATE, { contentId, s3Key });
      } catch (error) {
        this.logger.error(`Video transcoding failed for: ${contentId}`, error.stack);
        await this.contentRepository.base.update({ id: contentId }, { status: ContentStatus.FAILED });
      }
    });
  }
}
