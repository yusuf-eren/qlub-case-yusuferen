import { Role } from 'src/auth/interfaces/roles.interface';

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: Role;
  active: boolean;
}

export interface UserAttrs extends IUser {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export type IUserJwt = Omit<UserAttrs, 'password'>;
