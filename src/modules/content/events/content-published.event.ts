/**
 * Event emitted when content transitions to PUBLISHED status.
 */
export class ContentPublishedEvent {
  /** Unique ID of the published content */
  readonly contentId: string;

  /** Type of content (video, audio, document, etc.) */
  readonly contentType: string;

  /** ID of the user who triggered the publish */
  readonly userId: string;

  /** Title of the content */
  readonly title: string;

  /** ISO-8601 timestamp of when the publish occurred */
  readonly timestamp: string;

  constructor(params: {
    contentId: string;
    contentType: string;
    userId: string;
    title: string;
  }) {
    this.contentId = params.contentId;
    this.contentType = params.contentType;
    this.userId = params.userId;
    this.title = params.title;
    this.timestamp = new Date().toISOString();
  }
}
