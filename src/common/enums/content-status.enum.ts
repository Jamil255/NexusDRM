/**
 * Enumeration of content lifecycle statuses.
 *
 * Tracks the state of digital content through ingestion,
 * processing, publication, and archival stages.
 */
export enum ContentStatus {
  /** Content has been created but not yet submitted for processing. */
  DRAFT = 'DRAFT',

  /** Content is currently being processed (transcoding, encryption, etc.). */
  PROCESSING = 'PROCESSING',

  /** Content is live and available for licensed consumption. */
  PUBLISHED = 'PUBLISHED',

  /** Content has been taken offline and archived. */
  ARCHIVED = 'ARCHIVED',

  /** Content processing failed (transcoding error, encryption error, etc.). */
  FAILED = 'FAILED',
}
