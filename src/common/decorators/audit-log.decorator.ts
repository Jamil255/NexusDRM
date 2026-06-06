import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key storing the audit action name for a route handler.
 */
export const AUDIT_LOG_KEY = 'audit_log_action';

/**
 * Decorator that marks a route handler for automatic audit logging.
 *
 * When applied, the audit-log interceptor (or a global event listener)
 * will record an audit entry capturing the action, the authenticated user,
 * and relevant request details.
 *
 * @param action - A descriptive action name (e.g. `'CONTENT_CREATED'`, `'LICENSE_REVOKED'`).
 *
 * @example
 *   @Post()
 *   @AuditLog('CONTENT_CREATED')
 *   createContent(@Body() dto: CreateContentDto) { ... }
 */
export const AuditLog = (action: string) =>
  SetMetadata(AUDIT_LOG_KEY, action);
