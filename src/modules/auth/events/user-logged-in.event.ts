/**
 * Emitted when a user successfully authenticates.
 */
export class UserLoggedInEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly ip: string,
    public readonly userAgent: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
