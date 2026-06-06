import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { QueueService } from '@common/queue/queue.service';
import { QUEUE_EMAIL_NOTIFICATION } from '@common/queue/queue.constants';

// Email templates
import { getLicenseExpiryEmail } from '../templates/license-expiry.template';
import { getSecurityAlertEmail } from '../templates/security-alert.template';
import { getContentUpdateEmail } from '../templates/content-update.template';

@Injectable()
export class EmailNotificationProcessor implements OnModuleInit {
  private readonly logger = new Logger(EmailNotificationProcessor.name);

  constructor(private readonly queueService: QueueService) {}

  async onModuleInit() {
    await this.queueService.subscribe(QUEUE_EMAIL_NOTIFICATION, async (job) => {
      const { userId, type, email, token, template, data } = job.data;
      this.logger.log(`Processing outbound email dispatch of type: ${type || template} to: ${email}`);

      let emailContent = { subject: 'DRMS Notification', body: '' };

      if (type === 'VERIFY_EMAIL') {
        emailContent = {
          subject: 'Verify your DRMS email address',
          body: `<p>Please verify your email using this token: <strong>${token}</strong></p>`,
        };
      } else if (type === 'PASSWORD_RESET') {
        emailContent = getSecurityAlertEmail(email, 'Password Reset Requested', 'N/A', `Token: ${token}`);
      } else if (template === 'LICENSE_EXPIRY') {
        emailContent = getLicenseExpiryEmail(email, data.licenseKey, new Date(data.expiryDate));
      } else if (template === 'SECURITY_ALERT') {
        emailContent = getSecurityAlertEmail(email, data.eventName, data.ip, data.details);
      } else if (template === 'CONTENT_UPDATE') {
        emailContent = getContentUpdateEmail(email, data.title, data.changeNote);
      }

      // Mock SMTP send operation
      this.logger.log(`[EMAIL SEND] Subject: "${emailContent.subject}"`);
      this.logger.log(`[EMAIL SEND] Body:\n${emailContent.body}`);
      this.logger.log(`Email sent successfully to: ${email}`);
    });
  }
}
