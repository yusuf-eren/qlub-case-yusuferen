import { ApiResponseProperty } from '@nestjs/swagger';

import { AnalyticsEvent } from '../models/analytics.model';

export class LandingResponse {
  @ApiResponseProperty({
    enum: [
      AnalyticsEvent.FAILED_LOGIN_ATTEMPT,
      AnalyticsEvent.NEW_USER,
      AnalyticsEvent.SUCCESSFUL_LOGIN,
      'TOTAL_USERS',
    ],
  })
  type: string;

  @ApiResponseProperty()
  total: number;
}
