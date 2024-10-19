import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard, RolesGuard } from 'src/auth/guards';
import { Cache } from 'src/cache/decorators/cache.decorator';
import { CacheInterceptor } from 'src/cache/interceptors/cache.interceptor';

import { AnalyticsService } from './analytics.service';
import { ListAnalyticsDto, GetReportsDto, LandingDto } from './dtos';
import { Roles } from '../auth/decorators';
import { AnalyticsEvent } from './models/analytics.model';
import { Reports } from './models/reports.model';
import { ListAnalyticsResponse } from './responses';
import { LandingResponse } from './responses/landing.response';
import { Role } from '../auth/interfaces/roles.interface';

@ApiBearerAuth()
@Roles(Role.ADMIN)
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(CacheInterceptor)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiResponse({ type: ListAnalyticsResponse })
  @Post('list')
  async list(
    @Body() listAnalyticsDto: ListAnalyticsDto,
  ): Promise<ListAnalyticsResponse> {
    return this.analyticsService.list(listAnalyticsDto);
  }

  @ApiResponse({ type: [LandingResponse] })
  @Cache('landing', 600) // 10 Minutes
  @Post('landing')
  async landing(
    @Body() landingDto: LandingDto,
  ): Promise<Array<LandingResponse>> {
    const data = [];
    if (landingDto.events.includes('TOTAL_USERS')) {
      data.push(
        this.analyticsService
          .totalUsers()
          .then((total) => ({ type: 'TOTAL_USERS', total })),
      );
    }
    if (landingDto.events.includes(AnalyticsEvent.NEW_USER)) {
      data.push(
        this.analyticsService
          .newUsers()
          .then((total) => ({ type: AnalyticsEvent.NEW_USER, total })),
      );
    }
    if (landingDto.events.includes(AnalyticsEvent.SUCCESSFUL_LOGIN)) {
      data.push(
        this.analyticsService
          .activeUsers()
          .then((total) => ({ type: AnalyticsEvent.SUCCESSFUL_LOGIN, total })),
      );
    }
    if (landingDto.events.includes(AnalyticsEvent.FAILED_LOGIN_ATTEMPT)) {
      data.push(
        this.analyticsService.failedLogins().then((total) => ({
          type: AnalyticsEvent.FAILED_LOGIN_ATTEMPT,
          total,
        })),
      );
    }

    return Promise.all(data);
  }

  @ApiResponse({ type: [Reports] })
  @Cache('reports', 86400) // 24 hours. (It is being invalidated by the cron job.)
  @Get('reports')
  async reports(
    @Query() getReportsDto: GetReportsDto,
  ): Promise<Array<Reports>> {
    return this.analyticsService.reports(getReportsDto);
  }
}
