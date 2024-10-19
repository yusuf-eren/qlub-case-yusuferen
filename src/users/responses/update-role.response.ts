import { ApiResponseProperty } from '@nestjs/swagger';

import { User } from '../models/users.model';

export class UpdateRoleResponse {
  @ApiResponseProperty()
  message: string;

  @ApiResponseProperty({ type: User })
  user: User;
}
