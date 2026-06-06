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
 * Stores individual key-value metadata entries for a content item.
 * Enables flexible, extensible metadata without schema changes.
 */
@Entity('content_metadata')
@Index('idx_content_metadata_content', ['contentId'])
@Index('idx_content_metadata_key', ['contentId', 'key'], { unique: true })
export class ContentMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Reference to the parent content record */
  @Column({ name: 'content_id', type: 'uuid' })
  contentId: string;

  /** Metadata key (e.g., 'author', 'isbn', 'duration') */
  @Column({ type: 'varchar', length: 255 })
  key: string;

  /** Metadata value stored as text */
  @Column({ type: 'text' })
  value: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  /** Parent content record */
  @ManyToOne(() => Content, (content) => content.metadataEntries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'content_id' })
  content: Content;
}
