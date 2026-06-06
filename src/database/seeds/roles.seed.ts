import { DataSource } from 'typeorm';
import { Role } from '../../modules/rbac/entities/role.entity';
import { Permission } from '../../modules/rbac/entities/permission.entity';
import { RolePermission } from '../../modules/rbac/entities/role-permission.entity';

export async function seedRoles(
  dataSource: DataSource,
  permissions: Permission[],
): Promise<Role[]> {
  const roleRepo = dataSource.getRepository(Role);
  const rpRepo = dataSource.getRepository(RolePermission);

  const defaultRoles = [
    { name: 'super_admin', description: 'Full access to the entire platform', hierarchyLevel: 0 },
    { name: 'org_admin', description: 'Full access within their organization', hierarchyLevel: 1 },
    { name: 'manager', description: 'Content manager with user administration', hierarchyLevel: 2 },
    { name: 'editor', description: 'Can create and edit content', hierarchyLevel: 3 },
    { name: 'viewer', description: 'Can only view content', hierarchyLevel: 4 },
  ];

  const seeded = [];
  for (const r of defaultRoles) {
    let existing = await roleRepo.findOne({
      where: { name: r.name, isSystem: true },
    });
    if (!existing) {
      existing = roleRepo.create({
        name: r.name,
        description: r.description,
        hierarchyLevel: r.hierarchyLevel,
        isSystem: true,
      });
      await roleRepo.save(existing);
    }
    seeded.push(existing);

    // Assign permissions
    await rpRepo.delete({ roleId: existing.id });
    const assignments = [];

    if (r.name === 'super_admin' || r.name === 'org_admin') {
      // All permissions
      for (const p of permissions) {
        assignments.push(rpRepo.create({ roleId: existing.id, permissionId: p.id }));
      }
    } else if (r.name === 'viewer') {
      // View permission only
      const readPerms = permissions.filter((p) => p.action === 'read');
      for (const p of readPerms) {
        assignments.push(rpRepo.create({ roleId: existing.id, permissionId: p.id }));
      }
    } else {
      // Editor / manager gets content/license manage permissions
      const midPerms = permissions.filter(
        (p) => p.resource === 'content' || p.resource === 'license',
      );
      for (const p of midPerms) {
        assignments.push(rpRepo.create({ roleId: existing.id, permissionId: p.id }));
      }
    }

    await rpRepo.save(assignments);
  }

  console.log(`Seeded system roles and permissions successfully.`);
  return seeded;
}
