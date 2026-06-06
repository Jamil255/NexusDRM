import { IsString, IsNotEmpty, IsNumber, IsOptional, IsObject } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  planName: string;

  @IsString()
  @IsNotEmpty()
  planTier: string;

  @IsNumber()
  priceMonthly: number;

  @IsNumber()
  priceYearly: number;

  @IsNumber()
  storageLimitBytes: number;

  @IsNumber()
  maxUsers: number;

  @IsNumber()
  maxContentItems: number;

  @IsNumber()
  maxConcurrentStreams: number;

  @IsOptional()
  @IsObject()
  features?: Record<string, any>;
}
export class SubscriptionResponseDto extends CreateSubscriptionDto {
  id: string;
  organizationId: string;
  status: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
}
