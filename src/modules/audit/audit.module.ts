import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { ContentAccessLog } from './entities/content-access-log.entity';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditCleanupProcessor } from './processors/audit-cleanup.processor';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, ContentAccessLog])],
  controllers: [AuditController],
  providers: [AuditService, AuditCleanupProcessor],
  exports: [AuditService],
})
export class AuditModule {}
