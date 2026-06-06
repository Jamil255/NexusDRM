/**
 * Emitted when a user successfully resets their password.
 */
export class PasswordResetEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
