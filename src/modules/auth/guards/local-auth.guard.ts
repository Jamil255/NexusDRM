import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that triggers the 'local' Passport strategy (email + password).
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
