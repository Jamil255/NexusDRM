import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { QueueService } from '@common/queue/queue.service';
import { QUEUE_AUDIT_CLEANUP } from '@common/queue/queue.constants';
import { AuditService } from '../audit.service';

@Injectable()
export class AuditCleanupProcessor implements OnModuleInit {
  private readonly logger = new Logger(AuditCleanupProcessor.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly auditService: AuditService,
  ) {}

  async onModuleInit() {
    await this.queueService.subscribe(QUEUE_AUDIT_CLEANUP, async () => {
      this.logger.log('Starting automated audit log pruning...');
      try {
        // Prune logs older than 90 days
        await this.auditService.cleanupOldLogs(90);
        this.logger.log('Audit log cleanup finished successfully');
      } catch (error) {
        this.logger.error('Failed to prune old audit logs', error.stack);
      }
    });

    // Run every day at 2:00 AM
    await this.queueService.schedule(QUEUE_AUDIT_CLEANUP, '0 2 * * *', {});
  }
}
