import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { QueueService } from '@common/queue/queue.service';
import { QUEUE_CONTENT_ENCRYPT } from '@common/queue/queue.constants';
import { EncryptionService } from '../services/encryption.service';
import { ContentRepository } from '../../content/content.repository';
import { ContentStatus } from '../../content/entities/content.entity';

@Injectable()
export class ContentEncryptionProcessor implements OnModuleInit {
  private readonly logger = new Logger(ContentEncryptionProcessor.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly encryptionService: EncryptionService,
    private readonly contentRepository: ContentRepository,
  ) {}

  async onModuleInit() {
    await this.queueService.subscribe(QUEUE_CONTENT_ENCRYPT, async (job) => {
      const { contentId, s3Key } = job.data;
      this.logger.log(`Processing asynchronous content encryption for: ${contentId}`);

      try {
        const encryptedKey = await this.encryptionService.encryptContentFile(contentId, s3Key);
        
        await this.contentRepository.base.update(
          { id: contentId },
          {
            s3Key: encryptedKey,
            isEncrypted: true,
            status: ContentStatus.PUBLISHED,
          },
        );
        this.logger.log(`Asymmetric envelope encryption complete for: ${contentId}`);
      } catch (error) {
        this.logger.error(`Async content encryption job failed for: ${contentId}`, error.stack);
        await this.contentRepository.base.update({ id: contentId }, { status: ContentStatus.FAILED });
      }
    });
  }
}
