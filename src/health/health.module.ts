import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { CacheService } from 'src/cache/cache.service';

import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule],
  providers: [CacheService],
  controllers: [HealthController],
})
export class HealthModule {}
