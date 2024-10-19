import { ApiResponseProperty } from '@nestjs/swagger';

import { Analytics } from '../models/analytics.model';

export class ListAnalyticsResponse {
  @ApiResponseProperty()
  totalPage: number;

  @ApiResponseProperty()
  page: number;

  @ApiResponseProperty()
  limit: number;

  @ApiResponseProperty({ type: [Analytics] })
  analytics: Analytics[];
}
