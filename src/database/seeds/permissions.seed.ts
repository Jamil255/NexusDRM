import { DataSource } from 'typeorm';
import { Permission } from '../../modules/rbac/entities/permission.entity';

export async function seedPermissions(dataSource: DataSource): Promise<Permission[]> {
  const permRepo = dataSource.getRepository(Permission);

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
    { resource: 'organization', action: 'manage', description: 'Manage organization tenants' },
    { resource: 'subscription', action: 'manage', description: 'Manage subscription settings' },
  ];

  const seeded = [];
  for (const p of defaultPerms) {
    let existing = await permRepo.findOne({
      where: { resource: p.resource, action: p.action },
    });
    if (!existing) {
      existing = permRepo.create(p);
      await permRepo.save(existing);
    }
    seeded.push(existing);
  }

  console.log(`Seeded ${seeded.length} permissions successfully.`);
  return seeded;
}
