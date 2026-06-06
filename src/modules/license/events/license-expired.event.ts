/**
 * Event emitted when a license expires (either naturally or via cron check).
 */
export class LicenseExpiredEvent {
  /** The license ID that expired */
  readonly licenseId: string;

  /** The user who held the license */
  readonly userId: string;

  /** The content the license was for */
  readonly contentId: string;

  /** The type of license that expired */
  readonly licenseType: string;

  /** When the license was set to expire */
  readonly expiresAt: string;

  /** ISO-8601 timestamp of when the expiry was detected/processed */
  readonly timestamp: string;

  constructor(params: {
    licenseId: string;
    userId: string;
    contentId: string;
    licenseType: string;
    expiresAt: Date;
  }) {
    this.licenseId = params.licenseId;
    this.userId = params.userId;
    this.contentId = params.contentId;
    this.licenseType = params.licenseType;
    this.expiresAt = params.expiresAt.toISOString();
    this.timestamp = new Date().toISOString();
  }
}
