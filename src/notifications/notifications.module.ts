import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Notifications } from './models/notifications.model';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [SequelizeModule.forFeature([Notifications])],
  providers: [NotificationsService],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
