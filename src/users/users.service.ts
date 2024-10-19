import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Attributes, FindAndCountOptions } from 'sequelize';
import { Op } from 'sequelize';

import { ListUsersDto, SearchUsersDto, UpdateRoleDto } from './dtos';
import { IUser, UserAttrs } from './interfaces/users.interface';
import { User } from './models/users.model';
import {
  ListUsersResponse,
  SearchUsersResponse,
  UpdateRoleResponse,
} from './responses';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userModel: typeof User) {}

  async create(data: IUser) {
    return this.userModel.create(data);
  }

  async update(id: number, data: Partial<IUser>) {
    const updatedUser = await this.userModel.update(data, {
      where: { id },
      returning: true,
    });

    if (!updatedUser[1].length) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User updated',
      user: updatedUser[1][0].toJSON(),
    };
  }

  async deleteOne(id: number) {
    return this.userModel.destroy({
      where: { id },
    });
  }

  async findOne(filter: Partial<UserAttrs>) {
    return this.userModel.findOne({
      where: { ...filter },
    });
  }

  async listUsers(listUsersDto: ListUsersDto): Promise<ListUsersResponse> {
    const { limit, page, sort, filter, sortBy } = listUsersDto;

    const query: Omit<FindAndCountOptions<Attributes<User>>, 'group'> = {
      limit,
      offset: (page - 1) * limit,
    };
    if (sortBy && sort) {
      query.order = [[sortBy, sort]];
    }
    if (filter) {
      query.where = { ...filter };
    }

    const users = await this.userModel.findAndCountAll(query);

    return {
      totalPage: Math.ceil(users.count / limit),
      page,
      limit,
      users: users.rows,
    };
  }

  async searchUsers(
    searchUsersDto: SearchUsersDto,
  ): Promise<SearchUsersResponse> {
    const { limit, page, search, sort, sortBy } = searchUsersDto;

    const query: Omit<FindAndCountOptions<Attributes<User>>, 'group'> = {
      limit,
      offset: (page - 1) * limit,
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ],
      },
    };
    if (sortBy && sort) {
      query.order = [[sortBy, sort]];
    }

    const users = await this.userModel.findAndCountAll(query);

    return {
      totalPage: Math.ceil(users.count / limit),
      page,
      limit,
      users: users.rows,
    };
  }

  async updateRole(updateRoleDto: UpdateRoleDto): Promise<UpdateRoleResponse> {
    const updatedDoc = await this.update(updateRoleDto.userID, {
      role: updateRoleDto.role,
    });

    if (!updatedDoc[1].length) {
      throw new NotFoundException('User not found');
    }

    return { message: 'Role updated', user: updatedDoc[1][0].toJSON() };
  }
}
