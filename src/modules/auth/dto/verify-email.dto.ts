import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for the verify-email flow — accepts the email verification token.
 */
export class VerifyEmailDto {
  @ApiProperty({
    example: '73cb632ec611e2e149b321dde018768f6f10fe8b6a8be5554f6960045895fbb7',
    description: 'Email verification token sent to the user\'s inbox',
  })
  @IsString()
  @IsNotEmpty({ message: 'Verification token is required' })
  token: string;
}
