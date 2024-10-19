import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { IdDto } from 'src/users/dtos';

import { CreateNotificationDto } from './dtos/create-notification.dto';
import { Notifications } from './models/notifications.model';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notifications)
    private notificationsModel: typeof Notifications,
  ) {}
  async createNotification(createNotificationDto: CreateNotificationDto) {
    await this.notificationsModel.create(createNotificationDto);
  }

  async deleteNotification(idDto: IdDto) {
    return this.notificationsModel.destroy({
      where: { id: idDto.id },
    });
  }

  async getNotifications() {
    return this.notificationsModel.findAll();
  }
}
