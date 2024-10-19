import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUserJwt } from 'src/users/interfaces/users.interface';

export const User = createParamDecorator(
  (data: keyof IUserJwt | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as IUserJwt;

    // If a specific key is requested, return that value; otherwise, return the entire user object
    return data ? user?.[data] : user;
  },
);
