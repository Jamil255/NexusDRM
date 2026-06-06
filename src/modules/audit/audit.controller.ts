import { Controller, Get, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

import { AuditService } from './audit.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RbacGuard } from '@common/guards/rbac.guard';
import { Permissions } from '@common/decorators/permissions.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Audit')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Permissions('audit:read')
  @ApiOperation({ summary: 'List audit logs (Admin only)' })
  async findAll(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('action') action?: string,
    @Query('resourceType') resourceType?: string,
    @Query('userId') userId?: string,
  ) {
    return this.auditService.findAll(user.organizationId, page || 1, limit || 20, {
      action,
      resourceType,
      userId,
    });
  }

  @Get('export')
  @Permissions('audit:read')
  @ApiOperation({ summary: 'Export audit logs as JSON' })
  async export(
    @CurrentUser() user: any,
    @Query('action') action?: string,
    @Query('resourceType') resourceType?: string,
    @Query('userId') userId?: string,
  ) {
    return this.auditService.exportLogs(user.organizationId, {
      action,
      resourceType,
      userId,
    });
  }

  @Get('stats')
  @Permissions('audit:read')
  @ApiOperation({ summary: 'Get audit activity aggregations' })
  async getStats(@CurrentUser() user: any) {
    return this.auditService.getAuditStats(user.organizationId);
  }

  @Get('content/:contentId')
  @Permissions('audit:read')
  @ApiOperation({ summary: 'Get access log history for specific content asset' })
  async getContentLogs(
    @Param('contentId') contentId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.getContentAccessLogs(contentId, page || 1, limit || 20);
  }

  @Get('user/:userId')
  @Permissions('audit:read')
  @ApiOperation({ summary: 'Get activity logs of a user' })
  async getUserLogs(
    @Param('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.getUserActivityLogs(userId, page || 1, limit || 20);
  }

  @Get(':id')
  @Permissions('audit:read')
  @ApiOperation({ summary: 'Get detail of an audit log' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.auditService.findById(id, user.organizationId);
  }
}
