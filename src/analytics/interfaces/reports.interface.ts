import { AnalyticsEvent } from '../models/analytics.model';

export interface ReportsAttrs {
  event: AnalyticsEvent;
  count: number;
  date: Date;
}

export interface IReports extends ReportsAttrs {
  id: number;
  createdAt: Date;
}
