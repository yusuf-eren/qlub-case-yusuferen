import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from 'src/auth/interfaces/roles.interface';

export class AdminUpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'admin', enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
