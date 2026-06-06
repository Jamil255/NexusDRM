import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { License } from './license.entity';

/**
 * Defines granular access policies for a specific license and content combination.
 * Controls download, print, copy, screen-capture permissions, geo-restrictions,
 * bandwidth limits, and usage caps.
 */
@Entity('access_policies')
@Index('idx_access_policies_license', ['licenseId'])
@Index('idx_access_policies_content', ['contentId'])
@Index('idx_access_policies_license_content', ['licenseId', 'contentId'], { unique: true })
export class AccessPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Reference to the license this policy applies to */
  @Column({ name: 'license_id', type: 'uuid' })
  licenseId: string;

  /** Reference to the content this policy applies to */
  @Column({ name: 'content_id', type: 'uuid' })
  contentId: string;

  /** Whether the user can download the content */
  @Column({ name: 'allow_download', type: 'boolean', default: false })
  allowDownload: boolean;

  /** Whether the user can print the content */
  @Column({ name: 'allow_print', type: 'boolean', default: false })
  allowPrint: boolean;

  /** Whether the user can copy text/content */
  @Column({ name: 'allow_copy', type: 'boolean', default: false })
  allowCopy: boolean;

  /** Whether screen capture is allowed */
  @Column({ name: 'allow_screen_capture', type: 'boolean', default: true })
  allowScreenCapture: boolean;

  /** Whether to overlay a watermark on the content */
  @Column({ name: 'enable_watermark', type: 'boolean', default: true })
  enableWatermark: boolean;

  /** Custom watermark text (null uses default) */
  @Column({ name: 'watermark_text', type: 'varchar', length: 500, nullable: true })
  watermarkText: string | null;

  /** ISO country codes where access is allowed (empty = all countries) */
  @Column({ name: 'allowed_countries', type: 'varchar', array: true, default: '{}' })
  allowedCountries: string[];

  /** IP addresses/CIDRs that are blocked from accessing content */
  @Column({ name: 'blocked_ips', type: 'varchar', array: true, default: '{}' })
  blockedIps: string[];

  /** Maximum number of views allowed (null = unlimited) */
  @Column({ name: 'max_views', type: 'int', nullable: true })
  maxViews: number | null;

  /** Maximum number of downloads allowed (null = unlimited) */
  @Column({ name: 'max_downloads', type: 'int', nullable: true })
  maxDownloads: number | null;

  /** Maximum bandwidth in Mbps for streaming (null = unlimited) */
  @Column({ name: 'bandwidth_limit_mbps', type: 'int', nullable: true })
  bandwidthLimitMbps: number | null;

  /** Start of the valid access window (null = immediately) */
  @Column({ name: 'valid_from', type: 'timestamptz', nullable: true })
  validFrom: Date | null;

  /** End of the valid access window (null = perpetual) */
  @Column({ name: 'valid_until', type: 'timestamptz', nullable: true })
  validUntil: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  /** Parent license */
  @ManyToOne(() => License, (license) => license.policies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'license_id' })
  license: License;
}
