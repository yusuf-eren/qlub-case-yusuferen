import { ApiResponseProperty } from '@nestjs/swagger';

import { Role } from '../interfaces/roles.interface';

export class SigninResponse {
  @ApiResponseProperty()
  token: string;

  @ApiResponseProperty()
  name: string;

  @ApiResponseProperty()
  email: string;

  @ApiResponseProperty({ enum: Role })
  role: Role;

  @ApiResponseProperty()
  active: boolean;
}
