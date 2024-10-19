import { AnalyticsEvent } from '../../analytics/models/analytics.model';

export interface NotificationsAttrs {
  id: number;
  event: AnalyticsEvent;
  interval: number;
  threshold: number;
}

export interface INotifications extends NotificationsAttrs {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}
