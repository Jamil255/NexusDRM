import { IsNotEmpty, IsOptional, IsString, MaxLength, IsEmail, MinLength, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating an organization with an admin user in one operation.
 */
export class CreateOrgWithAdminDto {
  @ApiProperty({ example: 'Acme Inc.', description: 'Organization display name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  orgName: string;

  @ApiPropertyOptional({ example: 'free', description: 'Subscription plan tier' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  plan?: string;

  @ApiPropertyOptional({ type: Object, description: 'Organization settings' })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  // Admin user fields
  @ApiProperty({ example: 'admin@acme.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  adminEmail: string;

  @ApiProperty({ example: 'P@ssw0rd!', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  adminPassword: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  adminFirstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  adminLastName: string;
}
