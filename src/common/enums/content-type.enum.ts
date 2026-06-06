/**
 * Enumeration of supported content types in the DRM system.
 *
 * Used to classify digital assets and determine appropriate
 * processing pipelines (transcoding, encryption, etc.).
 */
export enum ContentType {
  /** Video content (MP4, MKV, AVI, etc.) */
  VIDEO = 'VIDEO',

  /** Audio content (MP3, WAV, FLAC, etc.) */
  AUDIO = 'AUDIO',

  /** Document content (PDF, DOCX, EPUB, etc.) */
  DOCUMENT = 'DOCUMENT',

  /** Plain text content */
  TEXT = 'TEXT',
}
