import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Base streaming response with common fields.
 */
export class StreamResponseDto {
  @ApiProperty({ description: 'Content ID', format: 'uuid' })
  contentId: string;

  @ApiProperty({ description: 'Content title' })
  title: string;

  @ApiProperty({ description: 'Content type' })
  contentType: string;

  @ApiProperty({ description: 'Signed stream/access URL' })
  streamUrl: string;

  @ApiProperty({ description: 'URL expiration timestamp' })
  expiresAt: Date;

  @ApiPropertyOptional({ description: 'DRM configuration for the player' })
  drmConfig: Record<string, any> | null;

  @ApiPropertyOptional({ description: 'Watermark overlay configuration' })
  watermarkConfig: Record<string, any> | null;

  @ApiPropertyOptional({ description: 'Access policy restrictions' })
  accessPolicy: Record<string, any> | null;
}

/**
 * Video-specific stream response with HLS manifest info.
 */
export class VideoStreamResponseDto extends StreamResponseDto {
  @ApiPropertyOptional({ description: 'HLS manifest URL' })
  manifestUrl?: string;

  @ApiPropertyOptional({ description: 'Available quality variants' })
  qualities?: string[];

  @ApiPropertyOptional({ description: 'MIME type of the video' })
  mimeType?: string;

  @ApiPropertyOptional({ description: 'Video duration in seconds' })
  duration?: number;
}

/**
 * Audio-specific stream response.
 */
export class AudioStreamResponseDto extends StreamResponseDto {
  @ApiPropertyOptional({ description: 'MIME type of the audio' })
  mimeType?: string;

  @ApiPropertyOptional({ description: 'Audio duration in seconds' })
  duration?: number;

  @ApiPropertyOptional({ description: 'Whether range requests are supported' })
  supportsRangeRequests?: boolean;
}

/**
 * Document viewer response with page-level access.
 */
export class DocumentStreamResponseDto extends StreamResponseDto {
  @ApiPropertyOptional({ description: 'Total number of pages' })
  totalPages?: number;

  @ApiPropertyOptional({ description: 'Per-page access URLs' })
  pageUrls?: string[];

  @ApiPropertyOptional({ description: 'MIME type of the document' })
  mimeType?: string;
}

/**
 * Protected text content response.
 */
export class TextContentResponseDto extends StreamResponseDto {
  @ApiPropertyOptional({ description: 'Text content (may be partial for preview)' })
  textContent?: string;

  @ApiPropertyOptional({ description: 'Whether copy is disabled' })
  copyDisabled?: boolean;

  @ApiPropertyOptional({ description: 'Content encoding' })
  encoding?: string;
}
