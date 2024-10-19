import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class ListUsersFilterDto {
  @ApiPropertyOptional({
    example: 'true',
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({
    example: 'admin',
    enum: ['admin', 'user'],
  })
  @IsOptional()
  @IsEnum(['admin', 'user'])
  role?: string;
}

export class ListUsersDto {
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
    example: 'id',
  })
  @IsOptional()
  @IsEnum(['id', 'name', 'email', 'role', 'active'])
  sortBy?: 'id' | 'name' | 'email' | 'role' | 'active';

  @ApiPropertyOptional({
    example: {
      active: true,
      role: 'admin',
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ListUsersFilterDto)
  filter?: ListUsersFilterDto;
}
