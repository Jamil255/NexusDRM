import { Exclude, Expose } from 'class-transformer';

/**
 * Response DTO for a single notification.
 */
@Exclude()
export class NotificationResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  type: string;

  @Expose()
  title: string;

  @Expose()
  message: string;

  @Expose()
  data: Record<string, any> | null;

  @Expose()
  isRead: boolean;

  @Expose()
  readAt: Date | null;

  @Expose()
  createdAt: Date;
}

/**
 * Response DTO for paginated notification results.
 */
@Exclude()
export class PaginatedNotificationResponseDto {
  @Expose()
  data: NotificationResponseDto[];

  @Expose()
  total: number;

  @Expose()
  page: number;

  @Expose()
  limit: number;

  @Expose()
  totalPages: number;
}

/**
 * Response DTO for unread notification count.
 */
@Exclude()
export class UnreadCountResponseDto {
  @Expose()
  unreadCount: number;
}
