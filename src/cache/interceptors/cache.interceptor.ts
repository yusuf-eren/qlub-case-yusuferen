import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { CacheService } from '../cache.service';
import {
  CACHE_KEY_METADATA,
  CACHE_TTL_METADATA,
} from '../decorators/cache.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly cacheService: CacheService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const query = JSON.stringify(request.query);
    const body = JSON.stringify(request.body);

    /*
    It doesn't cover user based content cases such as user specific data or user specific permissions.
    but you can easily extend it to include user based caching by adding the user ID to the cache key.
    I will leave it this way to keep it simple by considering only the method and URL.
    */
    const endpointKey = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );
    const key = `${endpointKey}:${method}:${request.url}:${query}:${body}`;

    const ttl = this.reflector.get<number>(
      CACHE_TTL_METADATA,
      context.getHandler(),
    );

    if (!key || !ttl) {
      return next.handle();
    }

    const cachedResponse = await this.cacheService.get(key);
    if (cachedResponse) {
      this.logger.log(`Cache hit for key: ${key}`);
      return of(cachedResponse);
    }

    this.logger.log(`Cache miss for key: ${key}`);
    return next.handle().pipe(
      tap((response) => {
        this.logger.log(`Caching response for key: ${key}`);
        this.cacheService.set(key, response, ttl);
      }),
    );
  }
}
