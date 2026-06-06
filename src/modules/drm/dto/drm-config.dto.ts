import {
  IsBoolean,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for configuring DRM protection settings on a piece of content.
 */
export class DrmConfigDto {
  @ApiPropertyOptional({
    description: 'Enable visible watermark overlay',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  enableWatermark?: boolean;

  @ApiPropertyOptional({
    description: 'Custom watermark text (uses user email if not provided)',
    example: 'CONFIDENTIAL - {user_email}',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  watermarkText?: string;

  @ApiPropertyOptional({
    description: 'Whether downloading the content is allowed',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  allowDownload?: boolean;

  @ApiPropertyOptional({
    description: 'Whether screen capture is allowed',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  allowScreenCapture?: boolean;

  @ApiPropertyOptional({
    description: 'Time-to-live for signed URLs in seconds',
    default: 900,
    minimum: 60,
  })
  @IsOptional()
  @IsNumber()
  @Min(60)
  signedUrlTtl?: number;
}
