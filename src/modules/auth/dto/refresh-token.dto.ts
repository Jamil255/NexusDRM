import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for refreshing an access token using a refresh token.
 */
export class RefreshTokenDto {
  @ApiProperty({ description: 'The refresh token obtained during login' })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken: string;
}
