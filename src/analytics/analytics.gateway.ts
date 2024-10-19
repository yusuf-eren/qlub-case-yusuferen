import { Logger, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Role } from 'src/auth/interfaces/roles.interface';

import { Notifications } from '../notifications/models/notifications.model';

@WebSocketGateway({ namespace: '/analytics' })
export class AnalyticsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  /*
  I saved alerts in memory because I wanted to avoid querying the database or cache.
  I estimated the number of alerts to be small(At max 50 alerts). So I thought it would be better to store them in memory.
  */
  private eventTimestamps: { [key: string]: number[] } = {};
  adminNotifications: Array<Notifications> = [];
  private readonly logger = new Logger(AnalyticsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(Notifications)
    private readonly notifications: typeof Notifications,
  ) {}

  async onModuleInit() {
    await this.notifications.findAll().then((notifs) => {
      this.adminNotifications = notifs;
      this.logger.log('Admin notifications loaded');
    });
  }

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    if (!client.handshake.headers.authorization) {
      this.logger.error('Unauthorized');
      client.disconnect(true);
      return;
    } else if (client.handshake.headers.authorization) {
      const admin = this.validateAdmin(client.handshake.headers.authorization);
      if (!admin) {
        this.logger.error('Unauthorized');
        client.disconnect(true);
        return;
      }
    }

    this.logger.log(`Client connected: ${client.id}`);
  }

  checkAlert(event: string) {
    const now = Date.now();

    if (!this.eventTimestamps[event]) {
      this.eventTimestamps[event] = [];
    }
    this.eventTimestamps[event].push(now);

    const adminNotification = this.adminNotifications.find(
      (notif) => notif.event === event,
    );

    if (adminNotification) {
      const intervalMs = adminNotification.interval * 1000;
      const recentTimestamps = this.eventTimestamps[event].filter(
        (timestamp) => now - timestamp <= intervalMs,
      );

      this.eventTimestamps[event] = recentTimestamps;

      if (recentTimestamps.length > adminNotification.threshold) {
        this.sendAlert(event);
      }
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  sendUpdate(data: any) {
    this.logger.log('Sending update', data);
    this.checkAlert(data.event);
    this.server.emit('update', JSON.stringify(data));
  }

  sendAlert(event: string) {
    this.logger.log(`Alert: Event ${event} has exceeded the threshold`);
    this.server.emit('alert', JSON.stringify(event));
    // Implement your alert logic here, e.g., send an email or push notification
  }

  private validateAdmin(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      if (payload.role !== Role.ADMIN) {
        return false;
      }

      return payload;
    } catch (e) {
      this.logger.error(`Invalid token: ${e}`);
      return null;
    }
  }
}
