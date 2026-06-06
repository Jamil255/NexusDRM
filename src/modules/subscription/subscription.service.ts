import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
  ) {}

  async create(dto: CreateSubscriptionDto, orgId: string): Promise<SubscriptionPlan> {
    const start = new Date();
    const end = new Date();
    end.setMonth(start.getMonth() + 1); // 1 month period default

    const plan = this.planRepo.create({
      organizationId: orgId,
      planName: dto.planName,
      planTier: dto.planTier,
      priceMonthly: dto.priceMonthly,
      priceYearly: dto.priceYearly,
      storageLimitBytes: dto.storageLimitBytes,
      maxUsers: dto.maxUsers,
      maxContentItems: dto.maxContentItems,
      maxConcurrentStreams: dto.maxConcurrentStreams,
      features: dto.features || {},
      status: 'active',
      currentPeriodStart: start,
      currentPeriodEnd: end,
    });

    return this.planRepo.save(plan);
  }

  async findAll(orgId: string): Promise<SubscriptionPlan[]> {
    return this.planRepo.find({
      where: { organizationId: orgId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, orgId: string): Promise<SubscriptionPlan> {
    const plan = await this.planRepo.findOne({
      where: { id, organizationId: orgId },
    });
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }
    return plan;
  }

  async update(id: string, dto: Partial<CreateSubscriptionDto>, orgId: string): Promise<SubscriptionPlan> {
    const plan = await this.findOne(id, orgId);
    Object.assign(plan, dto);
    return this.planRepo.save(plan);
  }

  async cancel(id: string, orgId: string): Promise<SubscriptionPlan> {
    const plan = await this.findOne(id, orgId);
    plan.status = 'cancelled';
    return this.planRepo.save(plan);
  }

  async getActivePlan(orgId: string): Promise<SubscriptionPlan | null> {
    return this.planRepo.findOne({
      where: { organizationId: orgId, status: 'active' },
      order: { createdAt: 'DESC' },
    });
  }
}
