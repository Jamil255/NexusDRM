import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { ContentAccessLog } from './entities/content-access-log.entity';
import { AuditLogFilterDto } from './dto/audit-log-filter.dto';

/**
 * Custom repository for audit log entities, providing advanced
 * QueryBuilder-based filtering, aggregation, and cleanup operations.
 */
@Injectable()
export class AuditRepository {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
    @InjectRepository(ContentAccessLog)
    private readonly contentAccessLogRepo: Repository<ContentAccessLog>,
  ) {}

  /**
   * Builds a filtered query for audit logs based on the provided filter DTO.
   * @param filters - The filter criteria
   * @returns A configured SelectQueryBuilder
   */
  private buildFilteredQuery(filters: AuditLogFilterDto): SelectQueryBuilder<AuditLog> {
    const qb = this.auditLogRepo.createQueryBuilder('log');

    if (filters.action) {
      qb.andWhere('log.action = :action', { action: filters.action });
    }

    if (filters.resourceType) {
      qb.andWhere('log.resourceType = :resourceType', { resourceType: filters.resourceType });
    }

    if (filters.userId) {
      qb.andWhere('log.userId = :userId', { userId: filters.userId });
    }

    if (filters.organizationId) {
      qb.andWhere('log.organizationId = :organizationId', { organizationId: filters.organizationId });
    }

    if (filters.status) {
      qb.andWhere('log.status = :status', { status: filters.status });
    }

    if (filters.startDate) {
      qb.andWhere('log.createdAt >= :startDate', { startDate: new Date(filters.startDate) });
    }

    if (filters.endDate) {
      qb.andWhere('log.createdAt <= :endDate', { endDate: new Date(filters.endDate) });
    }

    return qb;
  }

  /**
   * Finds paginated audit logs matching the given filters.
   * @param filters - Query filters and pagination params
   * @returns Tuple of [results, totalCount]
   */
  async findAllFiltered(
    filters: AuditLogFilterDto,
  ): Promise<[AuditLog[], number]> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.buildFilteredQuery(filters);
    qb.orderBy('log.createdAt', 'DESC');
    qb.skip(skip).take(limit);

    return qb.getManyAndCount();
  }

  /**
   * Finds a single audit log by ID.
   * @param id - The audit log UUID
   * @returns The audit log or null
   */
  async findById(id: string): Promise<AuditLog | null> {
    return this.auditLogRepo.findOne({ where: { id } });
  }

  /**
   * Exports all audit logs matching the given filters (no pagination limit).
   * @param filters - Query filters
   * @returns Array of matching audit logs
   */
  async findAllForExport(filters: AuditLogFilterDto): Promise<AuditLog[]> {
    const qb = this.buildFilteredQuery(filters);
    qb.orderBy('log.createdAt', 'DESC');
    return qb.getMany();
  }

  /**
   * Creates a new audit log entry.
   * @param data - Partial audit log data
   * @returns The created audit log
   */
  async createLog(data: Partial<AuditLog>): Promise<AuditLog> {
    const log = this.auditLogRepo.create(data);
    return this.auditLogRepo.save(log);
  }

  /**
   * Creates a new content access log entry.
   * @param data - Partial content access log data
   * @returns The created content access log
   */
  async createContentAccessLog(data: Partial<ContentAccessLog>): Promise<ContentAccessLog> {
    const log = this.contentAccessLogRepo.create(data);
    return this.contentAccessLogRepo.save(log);
  }

  /**
   * Retrieves content access logs for a specific content item with pagination.
   * @param contentId - The content UUID
   * @param page - Page number (1-indexed)
   * @param limit - Items per page
   * @returns Tuple of [results, totalCount]
   */
  async findContentAccessLogs(
    contentId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<[ContentAccessLog[], number]> {
    const skip = (page - 1) * limit;

    return this.contentAccessLogRepo
      .createQueryBuilder('cal')
      .where('cal.contentId = :contentId', { contentId })
      .orderBy('cal.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();
  }

  /**
   * Retrieves audit logs for a specific user with pagination.
   * @param userId - The user UUID
   * @param page - Page number (1-indexed)
   * @param limit - Items per page
   * @returns Tuple of [results, totalCount]
   */
  async findUserActivityLogs(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<[AuditLog[], number]> {
    const skip = (page - 1) * limit;

    return this.auditLogRepo
      .createQueryBuilder('log')
      .where('log.userId = :userId', { userId })
      .orderBy('log.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();
  }

  /**
   * Aggregates audit log counts grouped by action type within a date range.
   * @param startDate - Start of range
   * @param endDate - End of range
   * @returns Aggregated counts by action, status, and daily time series
   */
  async getAggregatedStats(
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalLogs: number;
    countsByAction: Array<{ action: string; count: number }>;
    countsByStatus: Array<{ status: string; count: number }>;
    timeSeries: Array<{ date: string; count: number }>;
  }> {
    const baseQb = this.auditLogRepo.createQueryBuilder('log');

    if (startDate) {
      baseQb.andWhere('log.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      baseQb.andWhere('log.createdAt <= :endDate', { endDate });
    }

    // Total count
    const totalLogs = await baseQb.getCount();

    // Counts by action
    const countsByActionRaw = await this.auditLogRepo
      .createQueryBuilder('log')
      .select('log.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .where(startDate ? 'log.createdAt >= :startDate' : '1=1', { startDate })
      .andWhere(endDate ? 'log.createdAt <= :endDate' : '1=1', { endDate })
      .groupBy('log.action')
      .orderBy('count', 'DESC')
      .getRawMany();

    const countsByAction = countsByActionRaw.map((row) => ({
      action: row.action,
      count: parseInt(row.count, 10),
    }));

    // Counts by status
    const countsByStatusRaw = await this.auditLogRepo
      .createQueryBuilder('log')
      .select('log.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where(startDate ? 'log.createdAt >= :startDate' : '1=1', { startDate })
      .andWhere(endDate ? 'log.createdAt <= :endDate' : '1=1', { endDate })
      .groupBy('log.status')
      .getRawMany();

    const countsByStatus = countsByStatusRaw.map((row) => ({
      status: row.status,
      count: parseInt(row.count, 10),
    }));

    // Daily time series
    const timeSeriesRaw = await this.auditLogRepo
      .createQueryBuilder('log')
      .select("TO_CHAR(log.created_at, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where(startDate ? 'log.createdAt >= :startDate' : '1=1', { startDate })
      .andWhere(endDate ? 'log.createdAt <= :endDate' : '1=1', { endDate })
      .groupBy("TO_CHAR(log.created_at, 'YYYY-MM-DD')")
      .orderBy('date', 'ASC')
      .getRawMany();

    const timeSeries = timeSeriesRaw.map((row) => ({
      date: row.date,
      count: parseInt(row.count, 10),
    }));

    return { totalLogs, countsByAction, countsByStatus, timeSeries };
  }

  /**
   * Deletes audit logs older than the specified number of days.
   * @param retentionDays - Number of days to retain logs
   * @returns The number of deleted records
   */
  async deleteOlderThan(retentionDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.auditLogRepo
      .createQueryBuilder()
      .delete()
      .from(AuditLog)
      .where('created_at < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected ?? 0;
  }

  /**
   * Deletes content access logs older than the specified number of days.
   * @param retentionDays - Number of days to retain logs
   * @returns The number of deleted records
   */
  async deleteContentAccessLogsOlderThan(retentionDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.contentAccessLogRepo
      .createQueryBuilder()
      .delete()
      .from(ContentAccessLog)
      .where('created_at < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected ?? 0;
  }
}
