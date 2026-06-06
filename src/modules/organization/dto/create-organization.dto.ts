import { IsNotEmpty, IsOptional, IsString, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new organization.
 */
export class CreateOrganizationDto {
  @ApiProperty({ example: 'Acme Inc.', description: 'Organization display name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: 'acme-inc',
    description: 'URL-safe slug (auto-generated from name if omitted)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only',
  })
  slug?: string;

  @ApiPropertyOptional({ example: 'free', description: 'Subscription plan tier' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  plan?: string;
}
