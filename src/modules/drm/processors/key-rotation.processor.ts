import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { QueueService } from '@common/queue/queue.service';
import { QUEUE_KEY_ROTATION } from '@common/queue/queue.constants';
import { KeyManagementService } from '../services/key-management.service';

@Injectable()
export class KeyRotationProcessor implements OnModuleInit {
  private readonly logger = new Logger(KeyRotationProcessor.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly keyManagement: KeyManagementService,
  ) {}

  async onModuleInit() {
    await this.queueService.subscribe(QUEUE_KEY_ROTATION, async (job) => {
      const { contentId } = job.data;
      this.logger.log(`Executing key rotation task for: ${contentId}`);

      try {
        await this.keyManagement.rotateKey(contentId);
        this.logger.log(`Active encryption key successfully rotated for: ${contentId}`);
      } catch (error) {
        this.logger.error(`Key rotation job failed for: ${contentId}`, error.stack);
      }
    });
  }
}
