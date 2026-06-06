import { IsNotEmpty, IsOptional, IsString, IsInt, IsBoolean, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new role.
 */
export class CreateRoleDto {
  @ApiProperty({ example: 'Editor', description: 'Role name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Can edit and publish content' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: false, description: 'Whether this is a system-level role' })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @ApiPropertyOptional({ example: 10, description: 'Hierarchy level (higher = more authority)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  hierarchyLevel?: number;

  @ApiPropertyOptional({ description: 'Organization UUID this role belongs to' })
  @IsOptional()
  @IsString()
  organizationId?: string;
}
