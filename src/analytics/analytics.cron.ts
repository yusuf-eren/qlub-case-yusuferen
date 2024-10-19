import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import * as dayjs from 'dayjs';
import { Op } from 'sequelize';
import { CacheService } from 'src/cache/cache.service';

import { AnalyticsService } from './analytics.service';
import { AnalyticsEvent } from './models/analytics.model';
import { Reports } from './models/reports.model';

@Injectable()
export class AnalyticsCron {
  private readonly logger = new Logger(AnalyticsCron.name);

  constructor(
    @InjectModel(Reports) private readonly reportsModel: typeof Reports,
    private readonly analyticsService: AnalyticsService,
    private readonly cacheService: CacheService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async authOperations() {
    this.logger.log('Running authOperations cron job');

    // Yesterday 00:00:00
    const yesterdayStart = dayjs().subtract(1, 'day').startOf('day').toDate();
    // Yesterday 23:59:59
    const yesterdayEnd = dayjs().subtract(1, 'day').endOf('day').toDate();

    const events = await this.analyticsService.findAndCountAll({
      where: {
        event: {
          [Op.in]: [
            AnalyticsEvent.SUCCESSFUL_LOGIN,
            AnalyticsEvent.FAILED_LOGIN_ATTEMPT,
            AnalyticsEvent.NEW_USER,
          ],
        },
        createdAt: {
          // Yesterday, 00:00:00 to 23:59:59
          [Op.between]: [yesterdayStart, yesterdayEnd],
        },
      },
    });

    const report = events.rows.reduce(
      (acc, event) => {
        switch (event.event) {
          case AnalyticsEvent.SUCCESSFUL_LOGIN:
            acc[AnalyticsEvent.SUCCESSFUL_LOGIN]++;
            break;
          case AnalyticsEvent.FAILED_LOGIN_ATTEMPT:
            acc[AnalyticsEvent.FAILED_LOGIN_ATTEMPT]++;
            break;
          case AnalyticsEvent.NEW_USER:
            acc[AnalyticsEvent.NEW_USER]++;
            break;
        }

        return acc;
      },
      {
        [AnalyticsEvent.SUCCESSFUL_LOGIN]: 0,
        [AnalyticsEvent.FAILED_LOGIN_ATTEMPT]: 0,
        [AnalyticsEvent.NEW_USER]: 0,
      },
    );

    for (const [event, count] of Object.entries(report)) {
      await this.reportsModel.create({
        event: event as AnalyticsEvent,
        count,
        date: yesterdayStart,
      });
    }

    // This only occurs once a day. So we can ensure that the cache is invalidated.
    await this.cacheService.del('reports:*');

    this.logger.log('authOperations cron job completed');
  }
}
