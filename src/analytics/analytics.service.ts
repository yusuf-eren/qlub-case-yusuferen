import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Attributes, FindAndCountOptions } from 'sequelize';
import { Op } from 'sequelize';

import { ListAnalyticsDto } from './dtos';
import { GetReportsDto } from './dtos/get-reports.dto';
import { IAnalytics } from './interfaces/analytics.interface';
import { Analytics, AnalyticsEvent } from './models/analytics.model';
import { Reports } from './models/reports.model';
import { User } from '../users/models/users.model';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Analytics) private readonly analyticsModel: typeof Analytics,
    @InjectModel(User) private readonly usersModel: typeof User,
    @InjectModel(Reports) private readonly reportsModel: typeof Reports,
  ) {}

  async findAndCountAll(
    options: Omit<FindAndCountOptions<Attributes<Analytics>>, 'group'>,
  ) {
    return this.analyticsModel.findAndCountAll(options);
  }

  async create(data: IAnalytics): Promise<Analytics> {
    return this.analyticsModel.create(data);
  }

  async list(listAnalyticsDto: ListAnalyticsDto) {
    const { limit, page, sort, filter, sortBy } = listAnalyticsDto;

    const query: Omit<FindAndCountOptions<Attributes<Analytics>>, 'group'> = {
      limit,
      offset: (page - 1) * limit,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['role'],
          where: filter.userRole
            ? {
                role: filter.userRole,
              }
            : {},
          required: filter.userRole ? true : false,
        },
      ],
    };
    if (sortBy && sort) {
      query.order = [[sortBy, sort]];
    }
    if (filter) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userRole: _, startDate, endDate, ...filters } = filter;
      query.where = { ...filters };

      if (startDate && endDate) {
        query.where.createdAt = {
          [Op.between]: [startDate, endDate],
        };
      }
    }

    const analytics = await this.analyticsModel.findAndCountAll(query);

    return {
      totalPage: Math.ceil(analytics.count / limit),
      page,
      limit,
      analytics: analytics.rows,
    };
  }

  async totalUsers() {
    return this.usersModel.count();
  }

  async activeUsers() {
    return this.analyticsModel.count({
      where: {
        event: AnalyticsEvent.SUCCESSFUL_LOGIN,
        // In the last 7 days.
        createdAt: {
          [Op.gte]: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      // It should be distinct so we can count only unique active users.
      distinct: true,
      col: 'userID',
    });
  }

  async failedLogins() {
    return this.analyticsModel.count({
      where: {
        event: AnalyticsEvent.FAILED_LOGIN_ATTEMPT,
        // In the last 24 hours.
        createdAt: {
          [Op.gte]: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        },
      },
    });
  }

  async newUsers() {
    return this.analyticsModel.count({
      where: {
        event: AnalyticsEvent.NEW_USER,
        // In the last 7 days.
        createdAt: {
          [Op.gte]: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });
  }

  async reports(getReportsDto: GetReportsDto) {
    const filter = {};
    if (getReportsDto.day) {
      filter['date'] = {
        [Op.eq]: new Date(getReportsDto.day),
      };
    }
    return this.reportsModel.findAll({
      where: filter,
      attributes: ['event', 'count', 'date'],
    });
  }
}
