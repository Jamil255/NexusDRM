import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
  HealthCheck,
} from '@nestjs/terminus';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Perform comprehensive health checks on database and external dependencies' })
  async check() {
    return this.health.check([
      // Check database connection
      () => this.db.pingCheck('database', { timeout: 3000 }),
      // Check Cloudinary API endpoint
      () => this.http.pingCheck('cloudinary', 'https://api.cloudinary.com/v1_1'),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe' })
  async ready() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe' })
  async live() {
    return { status: 'up' };
  }
}
