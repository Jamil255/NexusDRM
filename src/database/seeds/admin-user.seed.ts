import { DataSource } from 'typeorm';
import { User } from '../../modules/user/entities/user.entity';
import { Role } from '../../modules/rbac/entities/role.entity';
import { UserRole } from '../../modules/rbac/entities/user-role.entity';
import { hashPassword } from '../../common/utils/hash.util';

export async function seedAdminUser(dataSource: DataSource, roles: Role[]): Promise<void> {
  const userRepo = dataSource.getRepository(User);
  const urRepo = dataSource.getRepository(UserRole);

  const email = 'admin@drms.com';
  const existingUser = await userRepo.findOne({ where: { email } });
  if (existingUser) {
    console.log('Admin user already exists. Skipping user seed.');
    return;
  }

  const superAdminRole = roles.find((r) => r.name === 'super_admin');
  if (!superAdminRole) {
    console.error('Super Admin role not found. Skipping admin user seed.');
    return;
  }

  const hashedPw = await hashPassword('Admin@123456');
  const user = userRepo.create({
    email,
    passwordHash: hashedPw,
    firstName: 'Super',
    lastName: 'Admin',
    status: 'ACTIVE',
    emailVerified: true,
  });

  const savedUser = await userRepo.save(user);

  const userRole = urRepo.create({
    userId: savedUser.id,
    roleId: superAdminRole.id,
    organizationId: null,
  });

  await urRepo.save(userRole);
  console.log(`Seeded default admin user "${email}" and assigned "super_admin" role.`);
}
