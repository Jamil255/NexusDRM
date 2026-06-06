import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { RbacService } from './rbac.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RbacGuard } from '@common/guards/rbac.guard';
import { Permissions } from '@common/decorators/permissions.decorator';

@ApiTags('Roles')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller()
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('roles')
  @Permissions('user:manage')
  @ApiOperation({ summary: 'List all roles' })
  async getRoles() {
    return this.rbacService.getRoles();
  }

  @Post('roles')
  @Permissions('user:manage')
  @ApiOperation({ summary: 'Create a custom role' })
  async createRole(@Body() dto: CreateRoleDto) {
    return this.rbacService.createRole(dto);
  }

  @Get('roles/:id')
  @Permissions('user:manage')
  @ApiOperation({ summary: 'Get role details' })
  async getRole(@Param('id') id: string) {
    return this.rbacService.getRole(id);
  }

  @Put('roles/:id')
  @Permissions('user:manage')
  @ApiOperation({ summary: 'Update custom role' })
  async updateRole(@Param('id') id: string, @Body() dto: Partial<CreateRoleDto>) {
    return this.rbacService.updateRole(id, dto);
  }

  @Delete('roles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions('user:manage')
  @ApiOperation({ summary: 'Delete custom role' })
  async deleteRole(@Param('id') id: string) {
    await this.rbacService.deleteRole(id);
  }

  @Post('roles/:id/permissions')
  @Permissions('user:manage')
  @ApiOperation({ summary: 'Assign permissions to a role' })
  async assignPermissions(
    @Param('id') id: string,
    @Body() dto: { permissionIds: string[] },
  ) {
    await this.rbacService.assignPermissionsToRole(id, dto.permissionIds);
    return { message: 'Permissions updated successfully' };
  }

  @Get('permissions')
  @Permissions('user:manage')
  @ApiOperation({ summary: 'List all permissions' })
  async getPermissions() {
    return this.rbacService.getPermissions();
  }

  @Post('users/:userId/roles')
  @Permissions('user:manage')
  @ApiOperation({ summary: 'Assign role to user' })
  async assignRole(
    @Param('userId') userId: string,
    @Body() dto: { roleId: string },
  ) {
    return this.rbacService.assignRoleToUser({ userId, roleId: dto.roleId });
  }

  @Delete('users/:userId/roles/:roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions('user:manage')
  @ApiOperation({ summary: 'Remove role from user' })
  async removeRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    await this.rbacService.removeRoleFromUser(userId, roleId);
  }

  @Get('users/:userId/permissions')
  @Permissions('user:manage')
  @ApiOperation({ summary: 'Get effective permissions for a user' })
  async getUserPermissions(@Param('userId') userId: string) {
    return this.rbacService.getUserPermissions(userId);
  }
}
