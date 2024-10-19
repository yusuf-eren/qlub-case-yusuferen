import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { User } from 'src/users/models/users.model';

import { AnalyticsGateway } from '../analytics.gateway';
import { IAnalytics, AnalyticsAttrs } from '../interfaces/analytics.interface';

export enum AnalyticsEvent {
  FAILED_LOGIN_ATTEMPT = 'FAILED_LOGIN_ATTEMPT',
  SUCCESSFUL_LOGIN = 'SUCCESSFUL_LOGIN',
  NEW_USER = 'NEW_USER',
  UPDATED_USER = 'UPDATED_USER',
}

@Table({
  tableName: 'analytics',
  createdAt: true,
  updatedAt: false, // All docs are read-only.
})
export class Analytics extends Model<AnalyticsAttrs, IAnalytics> {
  private static analyticsGateway: AnalyticsGateway;

  static setAnalyticsGateway(analyticsGateway: AnalyticsGateway) {
    Analytics.analyticsGateway = analyticsGateway;
  }

  @ApiProperty()
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  userID?: number;

  @ApiProperty({ enum: AnalyticsEvent })
  @Index
  @Column({
    type: DataType.ENUM,
    values: Object.values(AnalyticsEvent),
    allowNull: false,
  })
  event: AnalyticsEvent;

  @ApiProperty({ enum: HttpStatus })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  status: HttpStatus;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

  @ApiProperty()
  @BelongsTo(() => User, { as: 'user' })
  user: User;

  // Pre save hook
  @BeforeCreate
  static async beforeCreateHook(instance: Analytics) {
    this.analyticsGateway.sendUpdate(instance.toJSON());
  }
}
