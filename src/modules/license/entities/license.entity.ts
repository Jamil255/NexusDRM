import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { LicenseActivation } from './license-activation.entity';
import { AccessPolicy } from './access-policy.entity';

/**
 * Types of licenses that can be issued.
 */
export enum LicenseType {
  PERPETUAL = 'perpetual',
  SUBSCRIPTION = 'subscription',
  TRIAL = 'trial',
  RENTAL = 'rental',
  EDUCATIONAL = 'educational',
}

/**
 * Lifecycle status of a license.
 */
export enum LicenseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  SUSPENDED = 'suspended',
}

/**
 * Represents a license granting a user access to specific content.
 * Tracks usage limits, device activations, and expiration.
 */
@Entity('licenses')
@Index('idx_licenses_content', ['contentId'])
@Index('idx_licenses_user', ['userId'])
@Index('idx_licenses_organization', ['organizationId'])
@Index('idx_licenses_key', ['licenseKey'], { unique: true })
@Index('idx_licenses_status', ['status'])
@Index('idx_licenses_expires', ['expiresAt'])
export class License {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** The content this license grants access to */
  @Column({ name: 'content_id', type: 'uuid' })
  contentId: string;

  /** The user this license is assigned to */
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  /** The organization owning this license */
  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  /** Unique license key for external identification */
  @Column({ name: 'license_key', type: 'varchar', length: 128, unique: true })
  licenseKey: string;

  /** Type of license */
  @Column({
    name: 'license_type',
    type: 'enum',
    enum: LicenseType,
  })
  licenseType: LicenseType;

  /** Current status of the license */
  @Column({
    type: 'enum',
    enum: LicenseStatus,
    default: LicenseStatus.ACTIVE,
  })
  status: LicenseStatus;

  /** Maximum number of devices that can be activated simultaneously */
  @Column({ name: 'max_devices', type: 'int', default: 3 })
  maxDevices: number;

  /** Maximum concurrent streams allowed */
  @Column({ name: 'max_concurrent_streams', type: 'int', default: 1 })
  maxConcurrentStreams: number;

  /** Running total of content views */
  @Column({ name: 'total_views', type: 'int', default: 0 })
  totalViews: number;

  /** Running total of content downloads */
  @Column({ name: 'total_downloads', type: 'int', default: 0 })
  totalDownloads: number;

  /** Additional JSON restrictions (e.g., geo-restrictions, time windows) */
  @Column({ type: 'jsonb', default: {} })
  restrictions: Record<string, any>;

  /** When the license was first activated */
  @Column({ name: 'activated_at', type: 'timestamptz', nullable: true })
  activatedAt: Date | null;

  /** When the license expires */
  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  /** Device activations for this license */
  @OneToMany(() => LicenseActivation, (activation) => activation.license)
  activations: LicenseActivation[];

  /** Access policies associated with this license */
  @OneToMany(() => AccessPolicy, (policy) => policy.license)
  policies: AccessPolicy[];
}
