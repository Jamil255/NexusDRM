import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { ContentAccessLog } from './entities/content-access-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
    @InjectRepository(ContentAccessLog)
    private readonly accessRepo: Repository<ContentAccessLog>,
  ) {}

  async createLog(params: {
    userId?: string;
    organizationId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    oldValue?: any;
    newValue?: any;
    ip?: string;
    userAgent?: string;
    status?: string;
  }): Promise<AuditLog> {
    const log = this.auditRepo.create({
      userId: params.userId || null,
      organizationId: params.organizationId || null,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId || null,
      oldValue: params.oldValue || null,
      newValue: params.newValue || null,
      ipAddress: params.ip || null,
      userAgent: params.userAgent || null,
      status: params.status || 'success',
    });
    return this.auditRepo.save(log);
  }

  async logContentAccess(params: {
    contentId: string;
    userId: string;
    licenseId?: string;
    accessType: string;
    ip: string;
    deviceFingerprint?: string;
    durationSeconds?: number;
    bytesTransferred?: number;
    countryCode?: string;
  }): Promise<ContentAccessLog> {
    const log = this.accessRepo.create({
      contentId: params.contentId,
      userId: params.userId,
      licenseId: params.licenseId || null,
      accessType: params.accessType,
      ipAddress: params.ip,
      deviceFingerprint: params.deviceFingerprint || null,
      durationSeconds: params.durationSeconds || null,
      bytesTransferred: params.bytesTransferred || null,
      countryCode: params.countryCode || null,
    });
    return this.accessRepo.save(log);
  }

  async findAll(
    orgId: string,
    page: number = 1,
    limit: number = 20,
    filters?: { action?: string; resourceType?: string; userId?: string },
  ): Promise<{ items: AuditLog[]; total: number }> {
    const qb = this.auditRepo.createQueryBuilder('log')
      .where('log.organizationId = :orgId', { orgId })
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filters?.action) {
      qb.andWhere('log.action = :action', { action: filters.action });
    }
    if (filters?.resourceType) {
      qb.andWhere('log.resourceType = :resourceType', { resourceType: filters.resourceType });
    }
    if (filters?.userId) {
      qb.andWhere('log.userId = :userId', { userId: filters.userId });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async findById(id: string, orgId: string): Promise<AuditLog> {
    const log = await this.auditRepo.findOne({
      where: { id, organizationId: orgId },
    });
    if (!log) {
      throw new NotFoundException('Audit log not found');
    }
    return log;
  }

  async exportLogs(
    orgId: string,
    filters?: { action?: string; resourceType?: string; userId?: string },
  ): Promise<AuditLog[]> {
    const qb = this.auditRepo.createQueryBuilder('log')
      .where('log.organizationId = :orgId', { orgId })
      .orderBy('log.createdAt', 'DESC');

    if (filters?.action) {
      qb.andWhere('log.action = :action', { action: filters.action });
    }
    if (filters?.resourceType) {
      qb.andWhere('log.resourceType = :resourceType', { resourceType: filters.resourceType });
    }
    if (filters?.userId) {
      qb.andWhere('log.userId = :userId', { userId: filters.userId });
    }

    return qb.getMany();
  }

  async getContentAccessLogs(
    contentId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ items: ContentAccessLog[]; total: number }> {
    const [items, total] = await this.accessRepo.findAndCount({
      where: { contentId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  async getUserActivityLogs(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ items: AuditLog[]; total: number }> {
    const [items, total] = await this.auditRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  async getAuditStats(orgId: string): Promise<any> {
    const stats = await this.auditRepo
      .createQueryBuilder('log')
      .select('log.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .where('log.organizationId = :orgId', { orgId })
      .groupBy('log.action')
      .getRawMany();

    return stats;
  }

  async cleanupOldLogs(retentionDays: number): Promise<void> {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - retentionDays);

    await this.auditRepo.delete({
      createdAt: LessThan(dateLimit),
    });
  }
}
