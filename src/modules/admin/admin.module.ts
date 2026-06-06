import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

// Entities
import { User } from '../user/entities/user.entity';
import { Session } from '../user/entities/session.entity';
import { Content } from '../content/entities/content.entity';
import { License } from '../license/entities/license.entity';
import { Organization } from '../organization/entities/organization.entity';
import { SubscriptionPlan } from '../subscription/entities/subscription-plan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Session,
      Content,
      License,
      Organization,
      SubscriptionPlan,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
