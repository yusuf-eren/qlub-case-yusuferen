import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetReportsDto {
  @ApiPropertyOptional({
    type: 'string',
    example: '2024-10-17',
  })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  day?: string;
}
