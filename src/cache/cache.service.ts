import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit {
  private readonly logger = new Logger(CacheService.name);
  private client: Redis;

  async onModuleInit() {
    this.client = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
    });

    await this.client.ping().then(() => {
      this.logger.log('Connected to Redis');
    });

    // TODO: Remove on production. This is for demo purposes only.
    await this.client.flushall();
  }

  async pingCheck(): Promise<HealthIndicatorResult> {
    return new Promise((resolve, reject) => {
      this.client
        .ping()
        .then(() => {
          resolve({
            redis: { status: 'up' },
          });
        })
        .catch(() => {
          reject({
            redis: { status: 'down' },
          });
        });
    });
  }

  async get(key: string): Promise<any> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async incr(key: string): Promise<void> {
    await this.client.incr(key);
  }

  async expire(key: string, ttl: number): Promise<void> {
    await this.client.expire(key, ttl);
  }
}
