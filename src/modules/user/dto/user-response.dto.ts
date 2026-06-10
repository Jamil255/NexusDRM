import { Expose, Exclude } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Serialized user response — hides sensitive fields via class-transformer.
 */
@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  firstName: string;

  @Expose()
  @ApiProperty()
  lastName: string;

  @Expose()
  @ApiProperty()
  role: string;

  @Expose()
  @ApiProperty()
  permissions: string[];

  @Expose()
  @ApiPropertyOptional()
  avatarUrl: string | null;

  @Expose()
  @ApiProperty()
  status: string;

  @Expose()
  @ApiProperty()
  emailVerified: boolean;

  @Expose()
  @ApiPropertyOptional()
  organizationId: string | null;

  @Expose()
  @ApiPropertyOptional()
  lastLoginAt: Date | null;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
