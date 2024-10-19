import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import { AnalyticsEvent } from 'src/analytics/models/analytics.model';

export class CreateNotificationDto {
  @ApiProperty()
  @IsEnum(AnalyticsEvent)
  event: AnalyticsEvent;

  @ApiProperty()
  @IsNumber()
  interval: number;

  @ApiProperty()
  @IsNumber()
  threshold: number;
}
