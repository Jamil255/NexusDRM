import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Stores encryption keys for content files.
 * Keys are encrypted with the master key before storage (envelope encryption).
 * Supports key versioning for rotation scenarios.
 */
@Entity('content_keys')
@Index('idx_content_keys_content', ['contentId'])
@Index('idx_content_keys_content_active', ['contentId', 'isActive'])
export class ContentKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Reference to the content this key protects */
  @Column({ name: 'content_id', type: 'uuid' })
  contentId: string;

  /** Encryption algorithm used (e.g., 'aes-256-gcm') */
  @Column({
    name: 'encryption_algorithm',
    type: 'varchar',
    length: 50,
    default: 'aes-256-gcm',
  })
  encryptionAlgorithm: string;

  /** The content encryption key, itself encrypted with the master key */
  @Column({ name: 'encrypted_key', type: 'bytea' })
  encryptedKey: Buffer;

  /** Initialization vector used during key encryption */
  @Column({ type: 'bytea' })
  iv: Buffer;

  /** Version number of this key, incremented on rotation */
  @Column({ name: 'key_version', type: 'int', default: 1 })
  keyVersion: number;

  /** Whether this is the currently active key for the content */
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  /** Timestamp when this key was rotated (replaced by a new key) */
  @Column({ name: 'rotated_at', type: 'timestamptz', nullable: true })
  rotatedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
