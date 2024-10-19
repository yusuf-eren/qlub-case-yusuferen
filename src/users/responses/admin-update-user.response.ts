import { ApiResponseProperty } from '@nestjs/swagger';

import { IUser } from '../interfaces/users.interface';
import { User } from '../models/users.model';

export class AdminUpdateUserResponse {
  @ApiResponseProperty()
  message: string;

  @ApiResponseProperty({ type: User })
  user: IUser;
}
