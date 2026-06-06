import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for the forgot-password flow — accepts only the user's email.
 */
export class ForgotPasswordDto {
  @ApiProperty({ example: 'john@example.com', description: 'Email to send reset link to' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;
}
