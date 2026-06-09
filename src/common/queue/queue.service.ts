import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PgBoss = require('pg-boss');
import * as queueConstants from './queue.constants';

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private boss: PgBoss;
  private initPromise?: Promise<void>;

  constructor(private readonly configService: ConfigService) {
    const dbHost = this.configService.get<string>('DB_HOST', 'localhost');
    const dbPort = this.configService.get<number>('DB_PORT', 5432);
    const dbUser = this.configService.get<string>('DB_USERNAME', 'drms_user');
    const dbPassword = this.configService.get<string>('DB_PASSWORD', 'drms_password');
    const dbName = this.configService.get<string>('DB_DATABASE', 'drms_db');
    const schema = this.configService.get<string>('PGBOSS_SCHEMA', 'pgboss');

    const connectionString = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

    this.boss = new PgBoss({
      connectionString,
      schema,
    });

    this.boss.on('error', (error) => {
      this.logger.error('PgBoss error', error.stack);
    });
  }

  async onModuleInit() {
    if (!this.initPromise) {
      this.initPromise = (async () => {
        try {
          await this.boss.start();
          this.logger.log('PgBoss queue service started successfully');

          // Pre-create all known queues sequentially to avoid concurrent DDL deadlocks in pg-boss
          const queues = Object.values(queueConstants);
          for (const queueName of queues) {
            await this.boss.createQueue(queueName);
            this.logger.log(`Queue "${queueName}" initialized successfully`);
          }
        } catch (error) {
          this.logger.error('Failed to initialize PgBoss queues', error.stack);
          throw error;
        }
      })();
    }
    await this.initPromise;
  }

  async onModuleDestroy() {
    try {
      await this.boss.stop();
      this.logger.log('PgBoss queue service stopped');
    } catch (error) {
      this.logger.error('Failed to stop PgBoss queue service', error.stack);
    }
  }

  private async ensureInitialized() {
    if (!this.initPromise) {
      await this.onModuleInit();
    }
    await this.initPromise;
  }

  async publish(queueName: string, data: any, options: PgBoss.SendOptions = {}): Promise<string | null> {
    try {
      await this.ensureInitialized();
      const jobId = await this.boss.send(queueName, data, options);
      this.logger.debug(`Published job ${jobId} to queue ${queueName}`);
      return jobId;
    } catch (error) {
      this.logger.error(`Failed to publish job to queue ${queueName}`, error.stack);
      return null;
    }
  }

  async subscribe(
    queueName: string,
    handler: (job: any) => Promise<void>,
    options?: PgBoss.WorkOptions,
  ): Promise<string> {
    try {
      await this.ensureInitialized();
      const workId = await this.boss.work(queueName, options || {}, async (job: any) => {
        try {
          const jobInstance = Array.isArray(job) ? job[0] : job;
          await handler(jobInstance);
        } catch (error) {
          const jobInstance = Array.isArray(job) ? job[0] : job;
          this.logger.error(`Error processing job ${jobInstance?.id} in queue ${queueName}`, error.stack);
          throw error;
        }
      });
      this.logger.log(`Subscribed worker to queue ${queueName}`);
      return workId || '';
    } catch (error) {
      this.logger.error(`Failed to subscribe to queue ${queueName}`, error.stack);
      throw error;
    }
  }

  async schedule(queueName: string, cronExpression: string, data: any): Promise<void> {
    try {
      await this.ensureInitialized();
      await this.boss.schedule(queueName, cronExpression, data);
      this.logger.log(`Scheduled queue ${queueName} with cron ${cronExpression}`);
    } catch (error) {
      this.logger.error(`Failed to schedule queue ${queueName}`, error.stack);
    }
  }
}

