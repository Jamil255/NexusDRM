import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueueService } from '@common/queue/queue.service';
import { QUEUE_EMAIL_NOTIFICATION } from '@common/queue/queue.constants';
import * as nodemailer from 'nodemailer';

// Email templates
import { getLicenseExpiryEmail } from '../templates/license-expiry.template';
import { getSecurityAlertEmail } from '../templates/security-alert.template';
import { getContentUpdateEmail } from '../templates/content-update.template';
import { getWelcomeEmail } from '../templates/welcome.template';

import { getVerifyEmailTemplate } from '../templates/verify-email.template';

@Injectable()
export class EmailNotificationProcessor implements OnModuleInit {
  private readonly logger = new Logger(EmailNotificationProcessor.name);
  private transporter: nodemailer.Transporter;
  private readonly frontendUrl: string;

  constructor(
    private readonly queueService: QueueService,
    private readonly configService: ConfigService,
  ) {
    const host = this.configService.get<string>('SMTP_HOST', 'localhost');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');

    const transportOptions: any = {
      host,
      port,
      secure: port === 465,
    };

    if (user && pass) {
      transportOptions.auth = { user, pass };
    }

    this.transporter = nodemailer.createTransport(transportOptions);
  }

  async onModuleInit() {
    await this.queueService.subscribe(QUEUE_EMAIL_NOTIFICATION, async (job) => {
      const { userId, type, email, token, template, data } = job.data;
      this.logger.log(`Processing outbound email dispatch of type: ${type || template} to: ${email}`);

      let emailContent = { subject: 'DRMS Notification', body: '' };

      if (type === 'VERIFY_EMAIL') {
        emailContent = getVerifyEmailTemplate(email, token, this.frontendUrl);
      } else if (type === 'PASSWORD_RESET') {
        emailContent = getSecurityAlertEmail(email, 'Password Reset Requested', 'N/A', `Token: ${token}`);
      } else if (template === 'WELCOME') {
        emailContent = getWelcomeEmail(email, data.firstName, data.password, data.roleName);
      } else if (template === 'LICENSE_EXPIRY') {
        emailContent = getLicenseExpiryEmail(email, data.licenseKey, new Date(data.expiryDate));
      } else if (template === 'SECURITY_ALERT') {
        emailContent = getSecurityAlertEmail(email, data.eventName, data.ip, data.details);
      } else if (template === 'CONTENT_UPDATE') {
        emailContent = getContentUpdateEmail(email, data.title, data.changeNote);
      }

      const from = this.configService.get<string>('SMTP_FROM', 'noreply@drms.com');

      try {
        await this.transporter.sendMail({
          from,
          to: email,
          subject: emailContent.subject,
          html: emailContent.body,
        });
        this.logger.log(`Email sent successfully to: ${email}`);
      } catch (error) {
        this.logger.error(`Failed to send email to: ${email}`, error.stack);
        throw error;
      }
    });
  }
}

