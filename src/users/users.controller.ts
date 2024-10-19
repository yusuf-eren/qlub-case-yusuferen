import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

import {
  IdDto,
  ListUsersDto,
  SearchUsersDto,
  UpdateRoleDto,
  UpdateUserDto,
  AdminUpdateUserDto,
} from './dtos';
import { IUserJwt } from './interfaces/users.interface';
import {
  AdminUpdateUserResponse,
  ListUsersResponse,
  SearchUsersResponse,
  UpdateRoleResponse,
  UpdateUserResponse,
} from './responses';
import { UsersService } from './users.service';
import { Roles, User } from '../auth/decorators';
import { AuthGuard, RolesGuard } from '../auth/guards';
import { Role } from '../auth/interfaces/roles.interface';

@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiResponse({ type: ListUsersResponse })
  @Roles(Role.ADMIN)
  @Post('list')
  async listUsers(
    @Body() listUsersDto: ListUsersDto,
  ): Promise<ListUsersResponse> {
    return this.usersService.listUsers(listUsersDto);
  }

  @ApiResponse({ type: SearchUsersResponse })
  @Roles(Role.ADMIN)
  @Post('search')
  async searchUsers(
    @Body() searchUsersDto: SearchUsersDto,
  ): Promise<SearchUsersResponse> {
    return this.usersService.searchUsers(searchUsersDto);
  }

  @ApiResponse({ type: UpdateRoleResponse })
  @Roles(Role.ADMIN)
  @Put('update-role')
  async createAdmin(
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<UpdateRoleResponse> {
    return this.usersService.updateRole(updateRoleDto);
  }

  @ApiResponse({ type: AdminUpdateUserResponse })
  @Roles(Role.ADMIN)
  @Put('update/:id')
  async updateRole(
    @Param() idDto: IdDto,
    adminUpdateUserDto: AdminUpdateUserDto,
  ): Promise<AdminUpdateUserResponse> {
    return this.usersService.update(idDto.id, adminUpdateUserDto);
  }

  @ApiResponse({ type: UpdateUserResponse })
  @Roles(Role.ADMIN, Role.USER)
  @Put('update')
  async update(
    @User() user: IUserJwt,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UpdateUserResponse> {
    return this.usersService.update(user.id, updateUserDto);
  }

  @ApiResponse({ type: Number })
  @Roles(Role.ADMIN)
  @Delete('delete/:id')
  async deleteUser(@Param() deleteUserDto: IdDto): Promise<number> {
    return this.usersService.deleteOne(deleteUserDto.id);
  }

  @ApiResponse({ type: Number })
  @Roles(Role.ADMIN, Role.USER)
  @Delete('delete')
  async deleteMe(@User() user: IUserJwt): Promise<number> {
    return this.usersService.deleteOne(user.id);
  }
}
