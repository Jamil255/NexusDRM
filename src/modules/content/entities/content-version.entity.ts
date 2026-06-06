import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Content } from './content.entity';

/**
 * Represents a specific version of a content file.
 * Each time new content is uploaded for the same Content record, a new version is created.
 */
@Entity('content_versions')
@Index('idx_content_versions_content', ['contentId'])
@Index('idx_content_versions_content_version', ['contentId', 'versionNumber'], { unique: true })
export class ContentVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Reference to the parent content record */
  @Column({ name: 'content_id', type: 'uuid' })
  contentId: string;

  /** Sequential version number, incremented with each new version */
  @Column({ name: 'version_number', type: 'int' })
  versionNumber: number;

  /** S3 object key for this version's file */
  @Column({ name: 's3_key', type: 'varchar', length: 1024 })
  s3Key: string;

  /** File size in bytes */
  @Column({ name: 'file_size', type: 'bigint' })
  fileSize: number;

  /** SHA-256 checksum for integrity verification */
  @Column({ name: 'checksum_sha256', type: 'varchar', length: 64 })
  checksumSha256: string;

  /** Optional note describing what changed in this version */
  @Column({ name: 'change_note', type: 'text', nullable: true })
  changeNote: string | null;

  /** The user who uploaded this version */
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  /** Parent content record */
  @ManyToOne(() => Content, (content) => content.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'content_id' })
  content: Content;
}
