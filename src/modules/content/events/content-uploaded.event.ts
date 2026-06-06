/**
 * Event emitted when new content has been uploaded to S3 and
 * a database record has been created in PROCESSING state.
 */
export class ContentUploadedEvent {
  /** Unique ID of the content record */
  readonly contentId: string;

  /** Type of content (video, audio, document, etc.) */
  readonly contentType: string;

  /** ID of the user who uploaded the content */
  readonly userId: string;

  /** ID of the organization owning the content */
  readonly organizationId: string;

  /** Size of the uploaded file in bytes */
  readonly fileSize: number;

  /** ISO-8601 timestamp of when the upload occurred */
  readonly timestamp: string;

  constructor(params: {
    contentId: string;
    contentType: string;
    userId: string;
    organizationId: string;
    fileSize: number;
  }) {
    this.contentId = params.contentId;
    this.contentType = params.contentType;
    this.userId = params.userId;
    this.organizationId = params.organizationId;
    this.fileSize = params.fileSize;
    this.timestamp = new Date().toISOString();
  }
}
