import { ApiResponseProperty } from '@nestjs/swagger';

import { User } from '../models/users.model';

export class ListUsersResponse {
  @ApiResponseProperty()
  totalPage: number;

  @ApiResponseProperty()
  page: number;

  @ApiResponseProperty()
  limit: number;

  @ApiResponseProperty({ type: [User] })
  users: User[];
}
