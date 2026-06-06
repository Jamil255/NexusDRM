import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { QueueService } from '@common/queue/queue.service';
import { QUEUE_LICENSE_EXPIRY_CHECK } from '@common/queue/queue.constants';
import { LicenseService } from '../license.service';

@Injectable()
export class LicenseExpiryProcessor implements OnModuleInit {
  private readonly logger = new Logger(LicenseExpiryProcessor.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly licenseService: LicenseService,
  ) {}

  async onModuleInit() {
    // Run daily license expiry checks
    await this.queueService.subscribe(QUEUE_LICENSE_EXPIRY_CHECK, async () => {
      this.logger.log('Running scheduled daily license expiration scanner...');
      try {
        await this.licenseService.checkExpiredLicenses();
        this.logger.log('Scheduled daily license expiration check complete');
      } catch (error) {
        this.logger.error('Failed to run license expiry scan', error.stack);
      }
    });

    // Schedule cron to run every day at 1:00 AM
    await this.queueService.schedule(QUEUE_LICENSE_EXPIRY_CHECK, '0 1 * * *', {});
  }
}
