import { AppDataSource } from '../data-source';
import { seedPermissions } from './permissions.seed';
import { seedRoles } from './roles.seed';
import { seedAdminUser } from './admin-user.seed';

async function run() {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Database connection established.');

    console.log('Running permissions seed...');
    const permissions = await seedPermissions(AppDataSource);

    console.log('Running roles seed...');
    const roles = await seedRoles(AppDataSource, permissions);

    console.log('Running admin user seed...');
    await seedAdminUser(AppDataSource, roles);

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

run();
