import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { AnalyticsEvent } from '../models/analytics.model';

export class LandingDto {
  @ApiPropertyOptional({
    type: 'array',
    enum: [
      AnalyticsEvent.NEW_USER,
      AnalyticsEvent.SUCCESSFUL_LOGIN,
      AnalyticsEvent.FAILED_LOGIN_ATTEMPT,
      AnalyticsEvent.UPDATED_USER,
      'TOTAL_USERS',
    ],
    default: [
      AnalyticsEvent.NEW_USER,
      AnalyticsEvent.SUCCESSFUL_LOGIN,
      AnalyticsEvent.FAILED_LOGIN_ATTEMPT,
      AnalyticsEvent.UPDATED_USER,
      'TOTAL_USERS',
    ],
  })
  @IsOptional()
  @IsEnum(
    [
      AnalyticsEvent.NEW_USER,
      AnalyticsEvent.SUCCESSFUL_LOGIN,
      AnalyticsEvent.FAILED_LOGIN_ATTEMPT,
      AnalyticsEvent.UPDATED_USER,
      'TOTAL_USERS',
    ],
    { each: true },
  )
  events?: Array<AnalyticsEvent | 'TOTAL_USERS'> = [
    AnalyticsEvent.NEW_USER,
    AnalyticsEvent.SUCCESSFUL_LOGIN,
    AnalyticsEvent.FAILED_LOGIN_ATTEMPT,
    AnalyticsEvent.UPDATED_USER,
    'TOTAL_USERS',
  ];
}
