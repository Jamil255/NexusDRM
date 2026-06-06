import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { License } from './entities/license.entity';
import { LicenseActivation } from './entities/license-activation.entity';
import { AccessPolicy } from './entities/access-policy.entity';

@Injectable()
export class LicenseRepository {
  constructor(
    @InjectRepository(License)
    private readonly licenseRepo: Repository<License>,
    @InjectRepository(LicenseActivation)
    private readonly activationRepo: Repository<LicenseActivation>,
    @InjectRepository(AccessPolicy)
    private readonly policyRepo: Repository<AccessPolicy>,
  ) {}

  get base(): Repository<License> {
    return this.licenseRepo;
  }

  get activationBase(): Repository<LicenseActivation> {
    return this.activationRepo;
  }

  get policyBase(): Repository<AccessPolicy> {
    return this.policyRepo;
  }
}
