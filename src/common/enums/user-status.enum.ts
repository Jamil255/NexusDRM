/**
 * Enumeration of user account statuses.
 *
 * Controls whether a user can authenticate and access
 * DRM-protected resources.
 */
export enum UserStatus {
  /** User account is fully active and operational. */
  ACTIVE = 'ACTIVE',

  /** Account temporarily suspended (e.g., policy violation). */
  SUSPENDED = 'SUSPENDED',

  /** Account locked due to repeated failed login attempts. */
  LOCKED = 'LOCKED',

  /** Account created but email/identity verification is pending. */
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',

  /** Account permanently deactivated by user or admin. */
  DEACTIVATED = 'DEACTIVATED',
}
