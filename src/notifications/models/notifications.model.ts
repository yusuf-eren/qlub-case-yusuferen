import { Table, Model, Column, DataType } from 'sequelize-typescript';

import { AnalyticsEvent } from '../../analytics/models/analytics.model';
import {
  INotifications,
  NotificationsAttrs,
} from '../interfaces/notifications.interface';

@Table({
  tableName: 'notifications',
  createdAt: true,
  updatedAt: true,
})
export class Notifications extends Model<NotificationsAttrs, INotifications> {
  @Column({
    type: DataType.ENUM,
    allowNull: false,
    values: Object.values(AnalyticsEvent),
  })
  event: AnalyticsEvent;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  interval: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  threshold: number;
}
