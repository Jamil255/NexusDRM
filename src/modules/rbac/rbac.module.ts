import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserRole } from './entities/user-role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { RbacService } from './rbac.service';
import { RbacController } from './rbac.controller';
import { RbacRepository } from './rbac.repository';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission, UserRole, RolePermission]),
  ],
  controllers: [RbacController],
  providers: [RbacService, RbacRepository],
  exports: [RbacService, RbacRepository],
})
export class RbacModule {}
