import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RbacGuard } from '@common/guards/rbac.guard';
import { Permissions } from '@common/decorators/permissions.decorator';

@ApiTags('Organizations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly orgService: OrganizationService) {}

  @Post()
  @Permissions('organization:manage')
  @ApiOperation({ summary: 'Create a new organization/tenant' })
  async create(@Body() dto: CreateOrganizationDto) {
    return this.orgService.create(dto);
  }

  @Get()
  @Permissions('organization:manage')
  @ApiOperation({ summary: 'List all organizations (SuperAdmin only)' })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.orgService.findAll(page || 1, limit || 20);
  }

  @Get(':id')
  @Permissions('organization:manage')
  @ApiOperation({ summary: 'Get organization details' })
  async findOne(@Param('id') id: string) {
    return this.orgService.findOne(id);
  }

  @Put(':id')
  @Permissions('organization:manage')
  @ApiOperation({ summary: 'Update organization details' })
  async update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.orgService.update(id, dto);
  }

  @Get(':id/members')
  @Permissions('organization:manage')
  @ApiOperation({ summary: 'List all members of an organization' })
  async getMembers(@Param('id') id: string) {
    return this.orgService.getMembers(id);
  }

  @Post(':id/invite')
  @Permissions('organization:manage')
  @ApiOperation({ summary: 'Invite a member to the organization' })
  async inviteMember(@Param('id') id: string, @Body() dto: { email: string }) {
    await this.orgService.inviteMember(id, dto.email);
    return { message: 'Member invited successfully' };
  }
}
