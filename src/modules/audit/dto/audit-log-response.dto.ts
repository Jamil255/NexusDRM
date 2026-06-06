import { Exclude, Expose, Type } from 'class-transformer';

/**
 * Response DTO for a single audit log entry.
 */
@Exclude()
export class AuditLogResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string | null;

  @Expose()
  organizationId: string | null;

  @Expose()
  action: string;

  @Expose()
  resourceType: string;

  @Expose()
  resourceId: string | null;

  @Expose()
  oldValue: Record<string, any> | null;

  @Expose()
  newValue: Record<string, any> | null;

  @Expose()
  ipAddress: string | null;

  @Expose()
  userAgent: string | null;

  @Expose()
  status: string;

  @Expose()
  createdAt: Date;
}

/**
 * Response DTO for a single content access log entry.
 */
@Exclude()
export class ContentAccessLogResponseDto {
  @Expose()
  id: string;

  @Expose()
  contentId: string;

  @Expose()
  userId: string;

  @Expose()
  licenseId: string | null;

  @Expose()
  accessType: string;

  @Expose()
  ipAddress: string;

  @Expose()
  deviceFingerprint: string | null;

  @Expose()
  durationSeconds: number | null;

  @Expose()
  bytesTransferred: string | null;

  @Expose()
  countryCode: string | null;

  @Expose()
  createdAt: Date;
}

/**
 * Paginated response wrapper for audit log results.
 */
@Exclude()
export class PaginatedAuditLogResponseDto {
  @Expose()
  @Type(() => AuditLogResponseDto)
  data: AuditLogResponseDto[];

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
 * Audit statistics response with counts grouped by action type.
 */
@Exclude()
export class AuditStatsResponseDto {
  @Expose()
  totalLogs: number;

  @Expose()
  countsByAction: Array<{ action: string; count: number }>;

  @Expose()
  countsByStatus: Array<{ status: string; count: number }>;

  @Expose()
  timeSeries: Array<{ date: string; count: number }>;
}
