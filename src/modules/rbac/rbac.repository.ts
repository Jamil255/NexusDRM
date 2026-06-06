import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from './entities/user-role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';

@Injectable()
export class RbacRepository {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: Repository<RolePermission>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  get userRoleBase(): Repository<UserRole> {
    return this.userRoleRepo;
  }

  get rolePermissionBase(): Repository<RolePermission> {
    return this.rolePermissionRepo;
  }

  get permissionBase(): Repository<Permission> {
    return this.permissionRepo;
  }

  get roleBase(): Repository<Role> {
    return this.roleRepo;
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const userRoles = await this.userRoleRepo.find({
      where: { userId },
      relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission'],
    });

    const permissionsMap = new Map<string, Permission>();

    for (const ur of userRoles) {
      const role = ur.role;
      if (role && role.rolePermissions) {
        for (const rp of role.rolePermissions) {
          if (rp.permission) {
            const key = `${rp.permission.resource}:${rp.permission.action}`;
            permissionsMap.set(key, rp.permission);
          }
        }
      }
    }

    return Array.from(permissionsMap.values());
  }

  async checkUserPermission(
    userId: string,
    resource: string,
    action: string,
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.some(
      (p) =>
        (p.resource === resource || p.resource === '*') &&
        (p.action === action || p.action === '*'),
    );
  }
}
