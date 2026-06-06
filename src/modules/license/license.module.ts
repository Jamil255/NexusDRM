import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { License } from './entities/license.entity';
import { LicenseActivation } from './entities/license-activation.entity';
import { AccessPolicy } from './entities/access-policy.entity';
import { LicenseService } from './license.service';
import { LicenseController } from './license.controller';
import { LicenseRepository } from './license.repository';
import { LicenseExpiryProcessor } from './processors/license-expiry.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([License, LicenseActivation, AccessPolicy]),
  ],
  controllers: [LicenseController],
  providers: [LicenseService, LicenseRepository, LicenseExpiryProcessor],
  exports: [LicenseService, LicenseRepository],
})
export class LicenseModule {}
