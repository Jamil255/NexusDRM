import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

/**
 * Represents the processing/publication status of content.
 */
export enum ContentStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  FAILED = 'failed',
}

/**
 * Represents the type of digital content.
 */
export enum ContentType {
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  IMAGE = 'image',
  TEXT = 'text',
  EBOOK = 'ebook',
}

/**
 * Core entity representing a piece of digital content managed by the DRMS.
 * Tracks S3 storage location, encryption state, versioning, and DRM configuration.
 */
@Entity('contents')
@Index('idx_contents_organization', ['organizationId'])
@Index('idx_contents_status', ['status'])
@Index('idx_contents_type_status', ['contentType', 'status'])
@Index('idx_contents_created_by', ['createdBy'])
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** The organization that owns this content */
  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  /** The user who originally uploaded this content */
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  /** Human-readable title of the content */
  @Column({ type: 'varchar', length: 500 })
  title: string;

  /** Optional description of the content */
  @Column({ type: 'text', nullable: true })
  description: string | null;

  /** The type of content (video, audio, document, etc.) */
  @Column({
    name: 'content_type',
    type: 'enum',
    enum: ContentType,
  })
  contentType: ContentType;

  /** Current lifecycle status of the content */
  @Column({
    type: 'enum',
    enum: ContentStatus,
    default: ContentStatus.DRAFT,
  })
  status: ContentStatus;

  /** S3 object key for the content file */
  @Column({ name: 's3_key', type: 'varchar', length: 1024 })
  s3Key: string;

  /** S3 bucket where the content is stored */
  @Column({ name: 's3_bucket', type: 'varchar', length: 255 })
  s3Bucket: string;

  /** Size of the content file in bytes */
  @Column({ name: 'file_size', type: 'bigint' })
  fileSize: number;

  /** MIME type of the content file */
  @Column({ name: 'mime_type', type: 'varchar', length: 255 })
  mimeType: string;

  /** SHA-256 checksum of the original file for integrity verification */
  @Column({ name: 'checksum_sha256', type: 'varchar', length: 64 })
  checksumSha256: string;

  /** Whether the content file has been encrypted at rest */
  @Column({ name: 'is_encrypted', type: 'boolean', default: false })
  isEncrypted: boolean;

  /** JSON configuration for DRM protection settings */
  @Column({ name: 'drm_config', type: 'jsonb', nullable: true })
  drmConfig: Record<string, any> | null;

  /** Arbitrary metadata key-value pairs stored as JSON */
  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  /** Current version number of the content */
  @Column({ name: 'current_version', type: 'int', default: 1 })
  currentVersion: number;

  /** Timestamp when the content was first published */
  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  /** Versions of this content */
  @OneToMany('ContentVersion', 'content')
  versions: import('./content-version.entity').ContentVersion[];

  /** Metadata entries for this content */
  @OneToMany('ContentMetadata', 'content')
  metadataEntries: import('./content-metadata.entity').ContentMetadata[];
}
