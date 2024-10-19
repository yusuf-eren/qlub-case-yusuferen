import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { CacheService } from '../../cache/cache.service'; // Assume you have a RedisService for managing Redis
import {
  RATE_LIMITER_KEY,
  RATE_LIMITER_TTL,
} from '../decorators/rate-limiter.decorator';

@Injectable()
export class RateLimiterInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly cacheService: CacheService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const maxAttempts = this.reflector.get<number>(
      RATE_LIMITER_KEY,
      context.getHandler(),
    );
    const ttl = this.reflector.get<number>(
      RATE_LIMITER_TTL,
      context.getHandler(),
    );

    if (!maxAttempts || !ttl) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    const key = `rate_limiter:${ip}:${context.getHandler().name}`;

    const attempts = await this.cacheService.get(key);
    if (attempts && parseInt(attempts) >= maxAttempts) {
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.cacheService.set(
      key,
      attempts ? parseInt(attempts) + 1 : 1,
      ttl,
    );

    return next.handle();
  }
}
