import { Module, OnModuleInit } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CacheService } from 'src/cache/cache.service';
import { User } from 'src/users/models/users.model';

import { AnalyticsController } from './analytics.controller';
import { AnalyticsCron } from './analytics.cron';
import { AnalyticsGateway } from './analytics.gateway';
import { AnalyticsService } from './analytics.service';
import { Analytics } from './models/analytics.model';
import { Reports } from './models/reports.model';
import { Notifications } from '../notifications/models/notifications.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Analytics, User, Reports, Notifications]),
  ],
  providers: [AnalyticsService, AnalyticsCron, CacheService, AnalyticsGateway],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule implements OnModuleInit {
  constructor(private readonly analyticsGateway: AnalyticsGateway) {}

  onModuleInit() {
    Analytics.setAnalyticsGateway(this.analyticsGateway);
  }
}
