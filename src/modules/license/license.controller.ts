import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { LicenseService } from './license.service';
import { CreateLicenseDto } from './dto/create-license.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RbacGuard } from '@common/guards/rbac.guard';
import { Permissions } from '@common/decorators/permissions.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { LicenseStatus } from './entities/license.entity';

@ApiTags('Licenses')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('licenses')
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Post()
  @Permissions('license:manage')
  @ApiOperation({ summary: 'Issue a new license for a user' })
  async create(@Body() dto: CreateLicenseDto, @CurrentUser() user: any) {
    return this.licenseService.createLicense(dto, user.organizationId || dto.organizationId);
  }

  @Get()
  @Permissions('license:manage')
  @ApiOperation({ summary: 'List all organization licenses' })
  async findAll(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('userId') userId?: string,
    @Query('contentId') contentId?: string,
    @Query('status') status?: LicenseStatus,
  ) {
    return this.licenseService.findAll(user.organizationId, page || 1, limit || 20, {
      userId,
      contentId,
      status,
    });
  }

  @Get(':id')
  @Permissions('license:manage')
  @ApiOperation({ summary: 'Get license details' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.licenseService.findById(id, user.organizationId);
  }

  @Put(':id')
  @Permissions('license:manage')
  @ApiOperation({ summary: 'Update license fields' })
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateLicenseDto>,
    @CurrentUser() user: any,
  ) {
    return this.licenseService.updateLicense(id, dto, user.organizationId);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a license on a device' })
  async activate(
    @Param('id') id: string,
    @Body() dto: { deviceFingerprint: string; deviceName: string },
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    return this.licenseService.activateLicense(id, dto.deviceFingerprint, dto.deviceName, ip);
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a license on a device' })
  async deactivate(
    @Param('id') id: string,
    @Body() dto: { deviceFingerprint: string },
  ) {
    await this.licenseService.deactivateLicense(id, dto.deviceFingerprint);
    return { message: 'Device deactivated successfully' };
  }

  @Post(':id/revoke')
  @Permissions('license:manage')
  @ApiOperation({ summary: 'Revoke a license' })
  async revoke(@Param('id') id: string, @CurrentUser() user: any) {
    return this.licenseService.revokeLicense(id, user.organizationId);
  }

  @Get(':id/activations')
  @Permissions('license:manage')
  @ApiOperation({ summary: 'List all active activations for a license' })
  async getActivations(@Param('id') id: string) {
    return this.licenseService.getActivations(id);
  }

  @Delete(':id/activations/:deviceFingerprint')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions('license:manage')
  @ApiOperation({ summary: 'Force deactivate a device activation' })
  async removeDevice(
    @Param('id') id: string,
    @Param('deviceFingerprint') deviceFingerprint: string,
  ) {
    await this.licenseService.removeDevice(id, deviceFingerprint);
  }
}
