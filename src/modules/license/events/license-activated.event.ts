/**
 * Event emitted when a license is activated on a device.
 */
export class LicenseActivatedEvent {
  /** The license ID that was activated */
  readonly licenseId: string;

  /** The user who activated the license */
  readonly userId: string;

  /** The content the license grants access to */
  readonly contentId: string;

  /** Fingerprint of the device the license was activated on */
  readonly deviceFingerprint: string;

  /** IP address of the activating device */
  readonly ipAddress: string;

  /** ISO-8601 timestamp of the activation */
  readonly timestamp: string;

  constructor(params: {
    licenseId: string;
    userId: string;
    contentId: string;
    deviceFingerprint: string;
    ipAddress: string;
  }) {
    this.licenseId = params.licenseId;
    this.userId = params.userId;
    this.contentId = params.contentId;
    this.deviceFingerprint = params.deviceFingerprint;
    this.ipAddress = params.ipAddress;
    this.timestamp = new Date().toISOString();
  }
}
