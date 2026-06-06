import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { License, LicenseStatus } from './entities/license.entity';
import { LicenseActivation } from './entities/license-activation.entity';
import { AccessPolicy } from './entities/access-policy.entity';
import { CreateLicenseDto } from './dto/create-license.dto';
import { generateRandomToken } from '@common/utils/hash.util';

@Injectable()
export class LicenseService {
  constructor(
    @InjectRepository(License)
    private readonly licenseRepo: Repository<License>,
    @InjectRepository(LicenseActivation)
    private readonly activationRepo: Repository<LicenseActivation>,
    @InjectRepository(AccessPolicy)
    private readonly policyRepo: Repository<AccessPolicy>,
  ) {}

  async createLicense(dto: CreateLicenseDto, orgId: string): Promise<License> {
    const key = `LIC-${generateRandomToken(16).toUpperCase()}`;

    const license = this.licenseRepo.create({
      contentId: dto.contentId,
      userId: dto.userId,
      organizationId: orgId,
      licenseKey: key,
      licenseType: dto.licenseType,
      status: LicenseStatus.ACTIVE,
      maxDevices: dto.maxDevices || 3,
      maxConcurrentStreams: dto.maxConcurrentStreams || 1,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      restrictions: dto.restrictions || {},
    });

    const savedLicense = await this.licenseRepo.save(license);

    // Create default access policy
    const policy = this.policyRepo.create({
      licenseId: savedLicense.id,
      contentId: dto.contentId,
      allowDownload: dto.policy?.allowDownload || false,
      allowPrint: dto.policy?.allowPrint || false,
      allowCopy: dto.policy?.allowCopy || false,
      allowScreenCapture: dto.policy?.allowScreenCapture !== false,
      enableWatermark: dto.policy?.enableWatermark !== false,
      watermarkText: dto.policy?.watermarkText || null,
      allowedCountries: dto.policy?.allowedCountries || [],
      blockedIps: dto.policy?.blockedIps || [],
    });
    await this.policyRepo.save(policy);

    return savedLicense;
  }

  async findAll(
    orgId: string,
    page: number = 1,
    limit: number = 20,
    filters?: { userId?: string; contentId?: string; status?: LicenseStatus },
  ): Promise<{ items: License[]; total: number }> {
    const qb = this.licenseRepo.createQueryBuilder('license')
      .where('license.organizationId = :orgId', { orgId })
      .orderBy('license.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filters?.userId) {
      qb.andWhere('license.userId = :userId', { userId: filters.userId });
    }
    if (filters?.contentId) {
      qb.andWhere('license.contentId = :contentId', { contentId: filters.contentId });
    }
    if (filters?.status) {
      qb.andWhere('license.status = :status', { status: filters.status });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async findById(id: string, orgId?: string): Promise<License> {
    const where: any = { id };
    if (orgId) {
      where.organizationId = orgId;
    }
    const license = await this.licenseRepo.findOne({
      where,
      relations: ['activations', 'policies'],
    });

    if (!license) {
      throw new NotFoundException('License not found');
    }
    return license;
  }

  async updateLicense(id: string, dto: Partial<CreateLicenseDto>, orgId: string): Promise<License> {
    const license = await this.findById(id, orgId);
    Object.assign(license, dto);
    return this.licenseRepo.save(license);
  }

  async activateLicense(
    id: string,
    deviceFingerprint: string,
    deviceName: string,
    ipAddress: string,
  ): Promise<LicenseActivation> {
    const license = await this.licenseRepo.findOne({
      where: { id },
      relations: ['activations'],
    });

    if (!license) {
      throw new NotFoundException('License not found');
    }

    if (license.status !== LicenseStatus.ACTIVE) {
      throw new BadRequestException(`License is not active: current status is ${license.status}`);
    }

    if (license.expiresAt && license.expiresAt < new Date()) {
      license.status = LicenseStatus.EXPIRED;
      await this.licenseRepo.save(license);
      throw new BadRequestException('License has expired');
    }

    // Check device limit
    const activeActivations = license.activations.filter((a) => a.isActive);
    const alreadyActive = activeActivations.find((a) => a.deviceFingerprint === deviceFingerprint);
    if (alreadyActive) {
      return alreadyActive;
    }

    if (activeActivations.length >= license.maxDevices) {
      throw new ConflictException(`Device activation limit reached (${license.maxDevices} devices max)`);
    }

    const activation = this.activationRepo.create({
      licenseId: license.id,
      deviceFingerprint,
      deviceName,
      ipAddress,
      isActive: true,
      activatedAt: new Date(),
    });

    if (!license.activatedAt) {
      license.activatedAt = new Date();
      await this.licenseRepo.save(license);
    }

    return this.activationRepo.save(activation);
  }

  async deactivateLicense(id: string, deviceFingerprint: string): Promise<void> {
    const activation = await this.activationRepo.findOne({
      where: { licenseId: id, deviceFingerprint, isActive: true },
    });

    if (!activation) {
      throw new NotFoundException('Active device activation not found');
    }

    activation.isActive = false;
    activation.deactivatedAt = new Date();
    await this.activationRepo.save(activation);
  }

  async revokeLicense(id: string, orgId: string): Promise<License> {
    const license = await this.findById(id, orgId);
    license.status = LicenseStatus.REVOKED;
    
    // Invalidate all active activations
    await this.activationRepo.update(
      { licenseId: id, isActive: true },
      { isActive: false, deactivatedAt: new Date() },
    );

    return this.licenseRepo.save(license);
  }

  async getActivations(id: string): Promise<LicenseActivation[]> {
    return this.activationRepo.find({ where: { licenseId: id } });
  }

  async removeDevice(id: string, deviceFingerprint: string): Promise<void> {
    await this.deactivateLicense(id, deviceFingerprint);
  }

  async validateLicense(contentId: string, userId: string): Promise<License> {
    const license = await this.licenseRepo.findOne({
      where: { contentId, userId },
      relations: ['policies'],
    });

    if (!license) {
      throw new UnauthorizedException('No license found for this content');
    }

    if (license.status !== LicenseStatus.ACTIVE) {
      throw new UnauthorizedException(`License is not active: status is ${license.status}`);
    }

    if (license.expiresAt && license.expiresAt < new Date()) {
      license.status = LicenseStatus.EXPIRED;
      await this.licenseRepo.save(license);
      throw new UnauthorizedException('License has expired');
    }

    return license;
  }

  async checkExpiredLicenses(): Promise<void> {
    const expiredLicenses = await this.licenseRepo
      .createQueryBuilder('license')
      .where('license.status = :status', { status: LicenseStatus.ACTIVE })
      .andWhere('license.expiresAt IS NOT NULL')
      .andWhere('license.expiresAt < :now', { now: new Date() })
      .getMany();

    if (expiredLicenses.length > 0) {
      const ids = expiredLicenses.map((l) => l.id);
      await this.licenseRepo.update(ids, { status: LicenseStatus.EXPIRED });
      
      // Deactivate activations
      await this.activationRepo.createQueryBuilder()
        .update(LicenseActivation)
        .set({ isActive: false, deactivatedAt: new Date() })
        .where('licenseId IN (:...ids)', { ids })
        .andWhere('isActive = true')
        .execute();
    }
  }
}

// Add simple helper for unauthorized responses inside validate
class UnauthorizedException extends BadRequestException {}
