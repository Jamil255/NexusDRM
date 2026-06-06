import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { QueueService } from '@common/queue/queue.service';
import { QUEUE_EMAIL_NOTIFICATION } from '@common/queue/queue.constants';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
    private readonly queueService: QueueService,
  ) {}

  async createNotification(params: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }): Promise<Notification> {
    const notif = this.notifRepo.create({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      data: params.data || null,
      isRead: false,
    });
    return this.notifRepo.save(notif);
  }

  async sendEmailNotification(params: {
    userId: string;
    templateName: string;
    data: any;
    email: string;
  }): Promise<void> {
    // Publish email job to PgBoss queue
    await this.queueService.publish(QUEUE_EMAIL_NOTIFICATION, {
      userId: params.userId,
      template: params.templateName,
      data: params.data,
      email: params.email,
    });
  }

  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ items: Notification[]; total: number }> {
    const [items, total] = await this.notifRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifRepo.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notif = await this.notifRepo.findOne({ where: { id, userId } });
    if (!notif) {
      throw new NotFoundException('Notification not found');
    }
    notif.isRead = true;
    notif.readAt = new Date();
    return this.notifRepo.save(notif);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notifRepo.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async deleteNotification(id: string, userId: string): Promise<void> {
    const notif = await this.notifRepo.findOne({ where: { id, userId } });
    if (!notif) {
      throw new NotFoundException('Notification not found');
    }
    await this.notifRepo.remove(notif);
  }

  async sendBulkNotification(params: {
    userIds: string[];
    type: string;
    title: string;
    message: string;
  }): Promise<void> {
    const notifications = params.userIds.map((userId) =>
      this.notifRepo.create({
        userId,
        type: params.type,
        title: params.title,
        message: params.message,
        isRead: false,
      }),
    );
    await this.notifRepo.save(notifications);
  }
}
