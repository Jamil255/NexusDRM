export class SystemHealthDto {
  uptimeSeconds: number;
  memoryUsage: { rss: number; heapTotal: number; heapUsed: number; external: number };
  cpuUsage: { user: number; system: number };
  dbConnectionPool: { totalConnections: number; activeConnections: number; idleConnections: number };
  queueDepths: { queueName: string; size: number }[];
}
