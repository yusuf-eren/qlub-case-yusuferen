import { HttpStatus } from '@nestjs/common';

import { AnalyticsEvent } from '../models/analytics.model';

export interface IAnalytics {
  userID?: number;
  event: AnalyticsEvent;
  status: HttpStatus;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
}

export interface AnalyticsAttrs extends IAnalytics {
  id: number;
  createdAt: Date;
}
