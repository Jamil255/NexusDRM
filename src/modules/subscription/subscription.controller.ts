import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RbacGuard } from '@common/guards/rbac.guard';
import { Permissions } from '@common/decorators/permissions.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Subscriptions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @Permissions('subscription:manage')
  @ApiOperation({ summary: 'Create or upgrade a subscription' })
  async create(@Body() dto: CreateSubscriptionDto, @CurrentUser() user: any) {
    return this.subscriptionService.create(dto, user.organizationId);
  }

  @Get()
  @ApiOperation({ summary: 'List organization subscriptions' })
  async findAll(@CurrentUser() user: any) {
    return this.subscriptionService.findAll(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription details' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.subscriptionService.findOne(id, user.organizationId);
  }

  @Put(':id')
  @Permissions('subscription:manage')
  @ApiOperation({ summary: 'Modify subscription settings' })
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateSubscriptionDto>,
    @CurrentUser() user: any,
  ) {
    return this.subscriptionService.update(id, dto, user.organizationId);
  }

  @Post(':id/cancel')
  @Permissions('subscription:manage')
  @ApiOperation({ summary: 'Cancel active subscription plan' })
  async cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.subscriptionService.cancel(id, user.organizationId);
  }
}
