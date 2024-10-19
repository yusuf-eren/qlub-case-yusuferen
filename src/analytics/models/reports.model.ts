import { ApiProperty } from '@nestjs/swagger';
import { Table, Model, Column, DataType } from 'sequelize-typescript';

import { AnalyticsEvent } from './analytics.model';
import { IReports, ReportsAttrs } from '../interfaces/reports.interface';

@Table({
  tableName: 'reports',
  createdAt: true,
  updatedAt: false, // All docs are read-only.
  indexes: [
    {
      fields: ['event', 'date'],
    },
  ],
})
export class Reports extends Model<ReportsAttrs, IReports> {
  @ApiProperty()
  @Column({
    type: DataType.ENUM,
    allowNull: false,
    values: Object.values(AnalyticsEvent),
  })
  event: AnalyticsEvent;

  @ApiProperty()
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  count: number;

  @ApiProperty()
  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  date: Date;
}
