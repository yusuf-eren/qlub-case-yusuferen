import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Role } from 'src/auth/interfaces/roles.interface';

import { AnalyticsEvent } from '../models/analytics.model';

class ListAnalyticsFilterDto {
  @ApiPropertyOptional({
    example: 'true',
  })
  @IsOptional()
  @IsInt()
  userID?: number;

  @ApiPropertyOptional({
    example: AnalyticsEvent.NEW_USER,
    enum: AnalyticsEvent,
  })
  @IsOptional()
  @IsEnum(AnalyticsEvent)
  event?: AnalyticsEvent;

  @ApiPropertyOptional({
    example: 'admin',
  })
  @IsOptional()
  @IsEnum(Role)
  userRole?: Role;

  // Implement time range filter
  @ApiPropertyOptional({
    example: '2021-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  startDate?: Date;

  @ApiPropertyOptional({
    example: '2021-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  endDate?: Date;
}

export class ListAnalyticsDto {
  @ApiPropertyOptional({
    example: '1',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    example: '10',
  })
  @IsOptional()
  @IsInt()
  @Max(100)
  @Min(1)
  limit: number = 10;

  @ApiPropertyOptional({
    example: 'asc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sort?: 'asc' | 'desc';

  @ApiPropertyOptional({
    example: 'event',
  })
  @IsOptional()
  @IsEnum(['id', 'userID', 'event', 'createdAt'])
  sortBy?: 'id' | 'userID' | 'event' | 'createdAt';

  @ApiPropertyOptional({
    example: {
      event: AnalyticsEvent.FAILED_LOGIN_ATTEMPT,
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ListAnalyticsFilterDto)
  filter?: ListAnalyticsFilterDto;
}
