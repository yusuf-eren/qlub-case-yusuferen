import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators';
import { AuthGuard, RolesGuard } from 'src/auth/guards';
import { Role } from 'src/auth/interfaces/roles.interface';
import { IdDto } from 'src/users/dtos';

import { CreateNotificationDto } from './dtos/create-notification.dto';
import { NotificationsService } from './notifications.service';

@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotifications() {
    return this.notificationsService.getNotifications();
  }

  @Post()
  createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.createNotification(createNotificationDto);
  }

  @Delete(':id')
  deleteNotification(@Param() idDto: IdDto) {
    return this.notificationsService.deleteNotification(idDto);
  }
}
