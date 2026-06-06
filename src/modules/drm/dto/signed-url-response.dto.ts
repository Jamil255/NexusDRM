import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Response DTO returned when generating a signed streaming URL.
 */
export class SignedUrlResponseDto {
  @ApiProperty({
    description: 'The signed stream URL',
    example: 'https://cdn.example.com/stream/abc123?sig=xyz&exp=1234567890',
  })
  streamUrl: string;

  @ApiProperty({
    description: 'Expiration timestamp of the signed URL',
  })
  expiresAt: Date;

  @ApiPropertyOptional({
    description: 'DRM configuration for the content player',
  })
  drmConfig: Record<string, any> | null;

  @ApiPropertyOptional({
    description: 'Watermark configuration for overlay rendering',
  })
  watermarkConfig: Record<string, any> | null;
}

/**
 * Response DTO for verifying a signed URL or access token.
 */
export class VerifyAccessResponseDto {
  @ApiProperty({ description: 'Whether the access is valid' })
  valid: boolean;

  @ApiPropertyOptional({ description: 'Content ID if valid' })
  contentId?: string;

  @ApiPropertyOptional({ description: 'User ID if valid' })
  userId?: string;

  @ApiPropertyOptional({ description: 'Reason if invalid' })
  reason?: string;
}
