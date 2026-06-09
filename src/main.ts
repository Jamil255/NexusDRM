import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { ResponseTransformInterceptor } from '@common/interceptors/response-transform.interceptor';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT', 3000);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  const corsOrigins = configService.get<string>('APP_CORS_ORIGINS', 'http://localhost:5173');

  // Security
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: corsOrigins.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Correlation-ID'],
  });

  // Global prefix
  app.setGlobalPrefix(apiPrefix);

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseTransformInterceptor(),
  );

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('DRMS API')
    .setDescription('Enterprise Digital Rights Management System API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT access token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'API Key for machine-to-machine auth',
      },
      'API-key',
    )
    .addTag('Auth', 'Authentication & session management')
    .addTag('Users', 'User management')
    .addTag('Organizations', 'Organization/tenant management')
    .addTag('Roles', 'Role & permission management (RBAC)')
    .addTag('Content', 'Content upload & management')
    .addTag('DRM', 'Digital rights management')
    .addTag('Licenses', 'License management')
    .addTag('Streaming', 'Content streaming')
    .addTag('Audit', 'Audit logs')
    .addTag('Notifications', 'Notification management')
    .addTag('Subscriptions', 'Subscription plans')
    .addTag('Admin', 'Admin dashboard')
    .addTag('Health', 'Health checks')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(port);
  console.log(`🚀 DRMS API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
