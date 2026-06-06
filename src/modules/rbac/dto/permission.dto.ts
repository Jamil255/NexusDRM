import { IsNotEmpty, IsOptional, IsString, IsArray, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating or updating a permission.
 */
export class PermissionDto {
  @ApiProperty({ example: 'content', description: 'Resource the permission applies to' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  resource: string;

  @ApiProperty({ example: 'create', description: 'Allowed action on the resource' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  action: string;

  @ApiPropertyOptional({ example: 'Allows creating new content items' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

/**
 * DTO for assigning multiple permissions to a role.
 */
export class AssignPermissionsDto {
  @ApiProperty({ type: [String], description: 'Array of permission UUIDs to assign' })
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}
