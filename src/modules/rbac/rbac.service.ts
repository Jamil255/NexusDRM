import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserRole } from './entities/user-role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { RbacRepository } from './rbac.repository';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';

@Injectable()
export class RbacService {
  constructor(
    private readonly rbacRepository: RbacRepository,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: Repository<RolePermission>,
  ) {}

  async createRole(dto: CreateRoleDto, organizationId?: string): Promise<Role> {
    const existing = await this.roleRepo.findOne({
      where: {
        name: dto.name,
        organizationId: organizationId || null,
      },
    });

    if (existing) {
      throw new ConflictException('Role already exists');
    }

    const role = this.roleRepo.create({
      name: dto.name,
      description: dto.description,
      organizationId: organizationId || null,
      isSystem: false,
      hierarchyLevel: dto.hierarchyLevel || 10,
    });

    return this.roleRepo.save(role);
  }

  async updateRole(id: string, dto: Partial<CreateRoleDto>): Promise<Role> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new ConflictException('Cannot update system roles');
    }

    Object.assign(role, dto);
    return this.roleRepo.save(role);
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new ConflictException('Cannot delete system roles');
    }

    await this.roleRepo.remove(role);
  }

  async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<void> {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Invalidate existing assignments
    await this.rolePermissionRepo.delete({ roleId });

    const rolePermissions = permissionIds.map((pId) =>
      this.rolePermissionRepo.create({
        roleId,
        permissionId: pId,
      }),
    );

    await this.rolePermissionRepo.save(rolePermissions);
  }

  async assignRoleToUser(dto: AssignRoleDto, organizationId?: string): Promise<UserRole> {
    const role = await this.roleRepo.findOne({ where: { id: dto.roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const existing = await this.userRoleRepo.findOne({
      where: {
        userId: dto.userId,
        roleId: dto.roleId,
        organizationId: organizationId || null,
      },
    });

    if (existing) {
      return existing;
    }

    const userRole = this.userRoleRepo.create({
      userId: dto.userId,
      roleId: dto.roleId,
      organizationId: organizationId || null,
    });

    return this.userRoleRepo.save(userRole);
  }

  async removeRoleFromUser(userId: string, roleId: string, organizationId?: string): Promise<void> {
    await this.userRoleRepo.delete({
      userId,
      roleId,
      organizationId: organizationId || null,
    });
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    return this.rbacRepository.getUserPermissions(userId);
  }

  async checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
    return this.rbacRepository.checkUserPermission(userId, resource, action);
  }

  async getRoles(): Promise<Role[]> {
    return this.roleRepo.find({ relations: ['rolePermissions', 'rolePermissions.permission'] });
  }

  async getRole(id: string): Promise<Role> {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async getPermissions(): Promise<Permission[]> {
    return this.permissionRepo.find();
  }

  async seedDefaultRoles(): Promise<void> {
    // Seed core permissions
    const defaultPerms = [
      { resource: 'content', action: 'read', description: 'Read content metadata' },
      { resource: 'content', action: 'write', description: 'Create and update content' },
      { resource: 'content', action: 'delete', description: 'Soft delete content' },
      { resource: 'content', action: 'publish', description: 'Publish content' },
      { resource: 'license', action: 'read', description: 'Read licenses' },
      { resource: 'license', action: 'manage', description: 'Create, update, and revoke licenses' },
      { resource: 'user', action: 'read', description: 'Read user profiles' },
      { resource: 'user', action: 'manage', description: 'Create and update users' },
      { resource: 'audit', action: 'read', description: 'Read audit logs' },
      { resource: 'admin', action: 'access', description: 'Access admin APIs' },
    ];

    for (const p of defaultPerms) {
      const existing = await this.permissionRepo.findOne({
        where: { resource: p.resource, action: p.action },
      });
      if (!existing) {
        await this.permissionRepo.save(this.permissionRepo.create(p));
      }
    }

    // Seed core system roles
    const systemRoles = [
      { name: 'super_admin', description: 'Full access to the entire platform', hierarchyLevel: 0 },
      { name: 'org_admin', description: 'Full access within their organization', hierarchyLevel: 1 },
      { name: 'manager', description: 'Content manager with user administration', hierarchyLevel: 2 },
      { name: 'editor', description: 'Can create and edit content', hierarchyLevel: 3 },
      { name: 'viewer', description: 'Can only view content', hierarchyLevel: 4 },
    ];

    for (const r of systemRoles) {
      const existing = await this.roleRepo.findOne({
        where: { name: r.name, isSystem: true },
      });
      if (!existing) {
        const role = this.roleRepo.create({
          name: r.name,
          description: r.description,
          hierarchyLevel: r.hierarchyLevel,
          isSystem: true,
        });
        const savedRole = await this.roleRepo.save(role);

        // Assign permissions to system roles
        const allPerms = await this.permissionRepo.find();
        if (r.name === 'super_admin') {
          await this.assignPermissionsToRole(savedRole.id, allPerms.map((p) => p.id));
        } else if (r.name === 'org_admin') {
          // org admin has everything except super admin functions (we give all for simplicity)
          await this.assignPermissionsToRole(savedRole.id, allPerms.map((p) => p.id));
        } else if (r.name === 'viewer') {
          const viewPerms = allPerms.filter((p) => p.action === 'read');
          await this.assignPermissionsToRole(savedRole.id, viewPerms.map((p) => p.id));
        }
      }
    }
  }
}
