import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { AdminService } from './admin.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RbacGuard } from '@common/guards/rbac.guard';
import { Permissions } from '@common/decorators/permissions.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @Permissions('admin:access')
  @ApiOperation({ summary: 'Get overview metrics for dashboard' })
  async getDashboard(@CurrentUser() user: any) {
    return this.adminService.getDashboardStats(user.organizationId);
  }

  @Get('analytics/users')
  @Permissions('admin:access')
  @ApiOperation({ summary: 'Get user analytics' })
  async getUserAnalytics(@CurrentUser() user: any) {
    return this.adminService.getUserAnalytics(user.organizationId);
  }

  @Get('analytics/content')
  @Permissions('admin:access')
  @ApiOperation({ summary: 'Get content analytics' })
  async getContentAnalytics(@CurrentUser() user: any) {
    return this.adminService.getContentAnalytics(user.organizationId);
  }

  @Get('analytics/revenue')
  @Permissions('admin:access')
  @ApiOperation({ summary: 'Get revenue analytics' })
  async getRevenueAnalytics(@CurrentUser() user: any) {
    return this.adminService.getRevenueAnalytics(user.organizationId);
  }

  @Get('system/health')
  @Permissions('admin:access')
  @ApiOperation({ summary: 'Get system resource health metrics' })
  async getHealth() {
    return this.adminService.getSystemHealth();
  }

  @Post('users/:id/suspend')
  @Permissions('user:manage')
  @ApiOperation({ summary: 'Suspend user' })
  async suspendUser(@Param('id') id: string) {
    return this.adminService.suspendUser(id);
  }

  @Post('users/:id/activate')
  @Permissions('user:manage')
  @ApiOperation({ summary: 'Activate user' })
  async activateUser(@Param('id') id: string) {
    return this.adminService.activateUser(id);
  }

  @Get('organizations')
  @Permissions('organization:manage')
  @ApiOperation({ summary: 'List all organizations with platform usage statistics' })
  async getOrgs() {
    return this.adminService.getOrganizationsWithStats();
  }
}
