/**
 * Enumeration of license models supported by the DRM system.
 *
 * Determines how content access is granted and for how long
 * a license remains valid.
 */
export enum LicenseType {
  /** One-time purchase with unlimited access duration. */
  PERPETUAL = 'PERPETUAL',

  /** License valid for a specific time window (start/end dates). */
  TIME_LIMITED = 'TIME_LIMITED',

  /** Recurring subscription-based access, renewed periodically. */
  SUBSCRIPTION = 'SUBSCRIPTION',

  /** Free trial access with limited duration and/or features. */
  TRIAL = 'TRIAL',
}
