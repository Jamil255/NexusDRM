import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for assigning a role to a user.
 */
export class AssignRoleDto {
  @ApiProperty({ description: 'Role UUID to assign' })
  @IsUUID()
  @IsNotEmpty()
  roleId: string;

  @ApiPropertyOptional({ description: 'Organization UUID scope for the assignment' })
  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
