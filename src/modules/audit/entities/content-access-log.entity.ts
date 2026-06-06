import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * ContentAccessLog tracks individual content access events for analytics,
 * usage-based billing, and DRM compliance reporting.
 */
@Entity('content_access_logs')
@Index('IDX_content_access_content_created', ['contentId', 'createdAt'])
@Index('IDX_content_access_user_created', ['userId', 'createdAt'])
export class ContentAccessLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'content_id', type: 'uuid' })
  contentId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'license_id', type: 'uuid', nullable: true })
  licenseId: string | null;

  @Column({ name: 'access_type', type: 'varchar', length: 50 })
  accessType: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45 })
  ipAddress: string;

  @Column({ name: 'device_fingerprint', type: 'varchar', length: 255, nullable: true })
  deviceFingerprint: string | null;

  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  durationSeconds: number | null;

  @Column({ name: 'bytes_transferred', type: 'bigint', nullable: true })
  bytesTransferred: string | null;

  @Column({ name: 'country_code', type: 'varchar', length: 2, nullable: true })
  countryCode: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
