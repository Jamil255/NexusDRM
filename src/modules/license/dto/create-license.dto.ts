import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsUUID,
  IsDateString,
  IsObject,
  IsInt,
  Min,
  Max,
  IsArray,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { LicenseType } from '../entities/license.entity';

/**
 * DTO for updating access policy on a license.
 */
export class UpdateAccessPolicyDto {
  @ApiPropertyOptional({ description: 'Allow content download' })
  @IsOptional()
  @IsBoolean()
  allowDownload?: boolean;

  @ApiPropertyOptional({ description: 'Allow printing' })
  @IsOptional()
  @IsBoolean()
  allowPrint?: boolean;

  @ApiPropertyOptional({ description: 'Allow copy/paste' })
  @IsOptional()
  @IsBoolean()
  allowCopy?: boolean;

  @ApiPropertyOptional({ description: 'Allow screen capture' })
  @IsOptional()
  @IsBoolean()
  allowScreenCapture?: boolean;

  @ApiPropertyOptional({ description: 'Enable watermark' })
  @IsOptional()
  @IsBoolean()
  enableWatermark?: boolean;

  @ApiPropertyOptional({ description: 'Custom watermark text' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  watermarkText?: string;

  @ApiPropertyOptional({ description: 'ISO country codes allowed', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedCountries?: string[];

  @ApiPropertyOptional({ description: 'Blocked IP addresses/CIDRs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  blockedIps?: string[];

  @ApiPropertyOptional({ description: 'Max view count (null = unlimited)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxViews?: number;

  @ApiPropertyOptional({ description: 'Max download count (null = unlimited)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxDownloads?: number;

  @ApiPropertyOptional({ description: 'Bandwidth limit in Mbps' })
  @IsOptional()
  @IsInt()
  @Min(0)
  bandwidthLimitMbps?: number;

  @ApiPropertyOptional({ description: 'Policy valid from' })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional({ description: 'Policy valid until' })
  @IsOptional()
  @IsDateString()
  validUntil?: string;
}

/**
 * DTO for creating a new license.
 */
export class CreateLicenseDto {
  @ApiProperty({ description: 'Content ID to license', format: 'uuid' })
  @IsUUID()
  contentId: string;

  @ApiProperty({ description: 'User ID to assign the license to', format: 'uuid' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Organization ID', format: 'uuid' })
  @IsUUID()
  organizationId: string;

  @ApiProperty({ description: 'License type', enum: LicenseType })
  @IsEnum(LicenseType)
  licenseType: LicenseType;

  @ApiPropertyOptional({ description: 'Maximum devices allowed', default: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxDevices?: number;

  @ApiPropertyOptional({ description: 'Maximum concurrent streams', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  maxConcurrentStreams?: number;

  @ApiPropertyOptional({ description: 'License expiration date' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Additional restrictions as JSON' })
  @IsOptional()
  @IsObject()
  restrictions?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Access Policy for the license', type: () => UpdateAccessPolicyDto })
  @IsOptional()
  @IsObject()
  policy?: UpdateAccessPolicyDto;
}

/**
 * DTO for activating a license on a device.
 */
export class ActivateLicenseDto {
  @ApiProperty({ description: 'Unique device fingerprint' })
  @IsString()
  @MaxLength(512)
  deviceFingerprint: string;

  @ApiPropertyOptional({ description: 'Human-readable device name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  deviceName?: string;

  @ApiProperty({ description: 'IP address of the device' })
  @IsString()
  @MaxLength(45)
  ipAddress: string;
}

/**
 * DTO for bulk-creating licenses.
 */
export class BulkCreateLicenseDto {
  @ApiProperty({ description: 'Array of license creation requests', type: [CreateLicenseDto] })
  @IsArray()
  @Type(() => CreateLicenseDto)
  licenses: CreateLicenseDto[];
}

/**
 * DTO for transferring a license to another user.
 */
export class TransferLicenseDto {
  @ApiProperty({ description: 'User ID to transfer the license to', format: 'uuid' })
  @IsUUID()
  newUserId: string;

  @ApiPropertyOptional({ description: 'Reason for the transfer' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
