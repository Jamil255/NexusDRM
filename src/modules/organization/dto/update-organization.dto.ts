import { IsOptional, IsString, IsObject, MaxLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating an existing organization.
 */
export class UpdateOrganizationDto {
  @ApiPropertyOptional({ example: 'Acme Corp.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 'acme-corp' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only',
  })
  slug?: string;

  @ApiPropertyOptional({ example: 'pro' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  plan?: string;

  @ApiPropertyOptional({
    example: { maxUsers: 50, features: ['analytics'] },
    description: 'Arbitrary JSON settings',
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}
