import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ContentType, ContentStatus } from '../entities/content.entity';

/**
 * Response DTO for a single content version.
 */
export class ContentVersionResponseDto {
  @ApiProperty({ description: 'Version ID' })
  id: string;

  @ApiProperty({ description: 'Version number' })
  versionNumber: number;

  @ApiProperty({ description: 'S3 object key' })
  s3Key: string;

  @ApiProperty({ description: 'File size in bytes' })
  fileSize: number;

  @ApiProperty({ description: 'SHA-256 checksum' })
  checksumSha256: string;

  @ApiPropertyOptional({ description: 'Version change note' })
  changeNote: string | null;

  @ApiProperty({ description: 'Uploader user ID' })
  createdBy: string;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;
}

/**
 * Response DTO for content details, including nested versions.
 */
export class ContentResponseDto {
  @ApiProperty({ description: 'Content ID', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Organization ID', format: 'uuid' })
  organizationId: string;

  @ApiProperty({ description: 'Creator user ID', format: 'uuid' })
  createdBy: string;

  @ApiProperty({ description: 'Content title' })
  title: string;

  @ApiPropertyOptional({ description: 'Content description' })
  description: string | null;

  @ApiProperty({ description: 'Content type', enum: ContentType })
  contentType: ContentType;

  @ApiProperty({ description: 'Content status', enum: ContentStatus })
  status: ContentStatus;

  @ApiProperty({ description: 'File size in bytes' })
  fileSize: number;

  @ApiProperty({ description: 'MIME type' })
  mimeType: string;

  @ApiProperty({ description: 'SHA-256 checksum' })
  checksumSha256: string;

  @ApiProperty({ description: 'Whether content is encrypted' })
  isEncrypted: boolean;

  @ApiPropertyOptional({ description: 'DRM configuration' })
  drmConfig: Record<string, any> | null;

  @ApiProperty({ description: 'Content metadata' })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'Current version number' })
  currentVersion: number;

  @ApiPropertyOptional({ description: 'Published timestamp' })
  publishedAt: Date | null;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Content versions',
    type: [ContentVersionResponseDto],
  })
  @Type(() => ContentVersionResponseDto)
  versions?: ContentVersionResponseDto[];
}

/**
 * Lightweight content list item DTO (without versions).
 */
export class ContentListItemDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiProperty({ enum: ContentType })
  contentType: ContentType;

  @ApiProperty({ enum: ContentStatus })
  status: ContentStatus;

  @ApiProperty()
  fileSize: number;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  isEncrypted: boolean;

  @ApiProperty()
  currentVersion: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
