import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';

@Entity('subscription_plans')
@Index('idx_subscription_plans_org', ['organizationId'])
export class SubscriptionPlan extends BaseEntity {
  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @Column({ name: 'plan_name', type: 'varchar', length: 100 })
  planName: string;

  @Column({ name: 'plan_tier', type: 'varchar', length: 50, default: 'free' })
  planTier: string;

  @Column({ name: 'price_monthly', type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  priceMonthly: number;

  @Column({ name: 'price_yearly', type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  priceYearly: number;

  @Column({ name: 'storage_limit_bytes', type: 'bigint', default: 5368709120 }) // 5GB default
  storageLimitBytes: number;

  @Column({ name: 'max_users', type: 'int', default: 5 })
  maxUsers: number;

  @Column({ name: 'max_content_items', type: 'int', default: 100 })
  maxContentItems: number;

  @Column({ name: 'max_concurrent_streams', type: 'int', default: 1 })
  maxConcurrentStreams: number;

  @Column({ type: 'jsonb', default: {} })
  features: Record<string, any>;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @Column({ name: 'current_period_start', type: 'timestamptz', nullable: true })
  currentPeriodStart: Date | null;

  @Column({ name: 'current_period_end', type: 'timestamptz', nullable: true })
  currentPeriodEnd: Date | null;
}
