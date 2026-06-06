import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for requesting a content stream.
 */
export class StreamRequestDto {
  @ApiPropertyOptional({ description: 'Device fingerprint for license validation' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  deviceFingerprint?: string;

  @ApiPropertyOptional({ description: 'Client IP address' })
  @IsOptional()
  @IsString()
  @MaxLength(45)
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'Preferred quality (e.g., 1080p, 720p)' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  quality?: string;
}
