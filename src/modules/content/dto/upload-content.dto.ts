import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentType } from '../entities/content.entity';

/**
 * DTO for uploading new content. The actual file is handled by
 * FileInterceptor; this DTO validates the accompanying metadata.
 */
export class UploadContentDto {
  @ApiProperty({
    description: 'Title of the content',
    example: 'Advanced TypeScript Patterns',
    minLength: 1,
    maxLength: 500,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional({
    description: 'Description of the content',
    example: 'A comprehensive guide to advanced TypeScript design patterns.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({
    description: 'Type of content being uploaded',
    enum: ContentType,
    example: ContentType.VIDEO,
  })
  @IsEnum(ContentType)
  contentType: ContentType;

  @ApiPropertyOptional({
    description: 'Arbitrary metadata key-value pairs',
    example: { author: 'John Doe', isbn: '978-3-16-148410-0' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
