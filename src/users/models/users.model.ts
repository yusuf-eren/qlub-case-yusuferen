import { ApiProperty } from '@nestjs/swagger';
import { Table, Column, Model, DataType, Index } from 'sequelize-typescript';

import { Role } from '../../auth/interfaces/roles.interface';
import { IUser, UserAttrs } from '../interfaces/users.interface';

@Table({ tableName: 'users' })
export class User extends Model<UserAttrs, IUser> {
  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @ApiProperty()
  @Index({ unique: true })
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @ApiProperty()
  @Column({
    type: DataType.ENUM,
    values: Object.values(Role),
    defaultValue: Role.USER,
    allowNull: false,
  })
  role: Role;

  @ApiProperty()
  @Index
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  active: boolean;

  public toJSON(): IUser {
    const values = Object.assign({}, this.get()) as IUser;
    delete values.password;
    return values;
  }
}
