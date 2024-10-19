import { SetMetadata } from '@nestjs/common';

export const RATE_LIMITER_KEY = 'rate_limiter_key';
export const RATE_LIMITER_TTL = 'rate_limiter_ttl';

export const RateLimit = (maxAttempts: number, ttl: number) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(RATE_LIMITER_KEY, maxAttempts)(target, propertyKey, descriptor);
    SetMetadata(RATE_LIMITER_TTL, ttl)(target, propertyKey, descriptor);
  };
};
