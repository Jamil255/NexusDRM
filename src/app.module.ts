import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Middleware
import { CorrelationIdMiddleware } from '@common/middleware/correlation-id.middleware';
import { RequestLoggerMiddleware } from '@common/middleware/request-logger.middleware';
import { TenantMiddleware } from '@common/middleware/tenant.middleware';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RbacModule } from '@modules/rbac/rbac.module';
import { OrganizationModule } from '@modules/organization/organization.module';
import { ContentModule } from '@modules/content/content.module';
import { DrmModule } from '@modules/drm/drm.module';
import { LicenseModule } from '@modules/license/license.module';
import { StreamingModule } from '@modules/streaming/streaming.module';
import { AuditModule } from '@modules/audit/audit.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { SubscriptionModule } from '@modules/subscription/subscription.module';
import { AdminModule } from '@modules/admin/admin.module';
import { HealthModule } from './health/health.module';
import { QueueModule } from '@common/queue/queue.module';
import { CloudinaryModule } from '@common/cloudinary/cloudinary.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const options = {
          type: 'postgres' as const,
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USERNAME', 'drms_user'),
          password: configService.get<string>('DB_PASSWORD', 'drms_password'),
          database: configService.get<string>('DB_DATABASE', 'drms_db'),
        };
        console.log('Resolved database options:', {
          host: options.host,
          port: options.port,
          username: options.username,
          database: options.database,
          // Hide password but show length
          passwordLength: options.password ? options.password.length : 0,
        });
        return {
          ...options,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
          logging: configService.get<boolean>('DB_LOGGING', false),
          migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
          migrationsRun: false,
          ssl: configService.get<string>('APP_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
        };
      },
    }),

    // Event Emitter (for inter-module communication)
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 20,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),

    // Queue (PgBoss)
    QueueModule,

    // Cloudinary Storage
    CloudinaryModule,

    // Core Modules

    AuthModule,
    UserModule,
    RbacModule,
    OrganizationModule,

    // Business Modules
    ContentModule,
    DrmModule,
    LicenseModule,
    StreamingModule,

    // Support Modules
    AuditModule,
    NotificationModule,
    SubscriptionModule,
    AdminModule,

    // Infrastructure
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggerMiddleware, TenantMiddleware)
      .forRoutes('*');
  }
}
