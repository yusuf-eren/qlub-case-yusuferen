import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';

import { Role } from '../../auth/interfaces/roles.interface';

export class UpdateRoleDto {
  @ApiProperty()
  @IsNumber()
  userID: number;

  @ApiProperty()
  @IsEnum(Role)
  role: Role;
}
