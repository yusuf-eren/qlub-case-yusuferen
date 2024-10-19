import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, SequelizeHealthIndicator } from '@nestjs/terminus';
import { CacheService } from 'src/cache/cache.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: SequelizeHealthIndicator,
    private readonly cache: CacheService,
  ) {}

  @Get()
  check() {
    return this.health.check([
      async () => this.db.pingCheck('postgres'),
      async () => this.cache.pingCheck(),
    ]);
  }
}
