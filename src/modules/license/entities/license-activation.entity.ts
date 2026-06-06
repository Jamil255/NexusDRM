import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { License } from './license.entity';

/**
 * Records an individual device activation for a license.
 * Enables enforcement of max-device limits and device management.
 */
@Entity('license_activations')
@Index('idx_license_activations_license', ['licenseId'])
@Index('idx_license_activations_device', ['licenseId', 'deviceFingerprint'], { unique: true })
export class LicenseActivation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Reference to the parent license */
  @Column({ name: 'license_id', type: 'uuid' })
  licenseId: string;

  /** Unique fingerprint identifying the device */
  @Column({ name: 'device_fingerprint', type: 'varchar', length: 512 })
  deviceFingerprint: string;

  /** Human-readable device name (e.g., "John's MacBook Pro") */
  @Column({ name: 'device_name', type: 'varchar', length: 255, nullable: true })
  deviceName: string | null;

  /** IP address from which the device was activated */
  @Column({ name: 'ip_address', type: 'varchar', length: 45 })
  ipAddress: string;

  /** Whether this activation is currently active */
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  /** When the device was activated */
  @CreateDateColumn({ name: 'activated_at', type: 'timestamptz' })
  activatedAt: Date;

  /** When the device was deactivated (null if still active) */
  @Column({ name: 'deactivated_at', type: 'timestamptz', nullable: true })
  deactivatedAt: Date | null;

  /** Parent license */
  @ManyToOne(() => License, (license) => license.activations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'license_id' })
  license: License;
}
