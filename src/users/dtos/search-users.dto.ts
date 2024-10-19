import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class SearchUsersDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  search: string;

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
}
