import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { LicenseType, LicenseStatus } from '../entities/license.entity';

/**
 * Response DTO for a device activation record.
 */
export class ActivationResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  deviceFingerprint: string;

  @ApiPropertyOptional()
  deviceName: string | null;

  @ApiProperty()
  ipAddress: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  activatedAt: Date;

  @ApiPropertyOptional()
  deactivatedAt: Date | null;
}

/**
 * Response DTO for an access policy record.
 */
export class AccessPolicyResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  allowDownload: boolean;

  @ApiProperty()
  allowPrint: boolean;

  @ApiProperty()
  allowCopy: boolean;

  @ApiProperty()
  allowScreenCapture: boolean;

  @ApiProperty()
  enableWatermark: boolean;

  @ApiPropertyOptional()
  watermarkText: string | null;

  @ApiProperty({ type: [String] })
  allowedCountries: string[];

  @ApiProperty({ type: [String] })
  blockedIps: string[];

  @ApiPropertyOptional()
  maxViews: number | null;

  @ApiPropertyOptional()
  maxDownloads: number | null;

  @ApiPropertyOptional()
  bandwidthLimitMbps: number | null;

  @ApiPropertyOptional()
  validFrom: Date | null;

  @ApiPropertyOptional()
  validUntil: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

/**
 * Full license response DTO with activations and policies.
 */
export class LicenseResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  contentId: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty({ format: 'uuid' })
  organizationId: string;

  @ApiProperty()
  licenseKey: string;

  @ApiProperty({ enum: LicenseType })
  licenseType: LicenseType;

  @ApiProperty({ enum: LicenseStatus })
  status: LicenseStatus;

  @ApiProperty()
  maxDevices: number;

  @ApiProperty()
  maxConcurrentStreams: number;

  @ApiProperty()
  totalViews: number;

  @ApiProperty()
  totalDownloads: number;

  @ApiProperty()
  restrictions: Record<string, any>;

  @ApiPropertyOptional()
  activatedAt: Date | null;

  @ApiPropertyOptional()
  expiresAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: [ActivationResponseDto] })
  @Type(() => ActivationResponseDto)
  activations?: ActivationResponseDto[];

  @ApiPropertyOptional({ type: [AccessPolicyResponseDto] })
  @Type(() => AccessPolicyResponseDto)
  policies?: AccessPolicyResponseDto[];
}
