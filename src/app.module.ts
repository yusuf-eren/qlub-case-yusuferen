import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule } from '@nestjs/sequelize';

import { AnalyticsInterceptor } from './analytics/analytics.interceptor';
import { AnalyticsModule } from './analytics/analytics.module';
import { Analytics } from './analytics/models/analytics.model';
import { Reports } from './analytics/models/reports.model';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { OTP } from './auth/models/otp.model';
import { CacheModule } from './cache/cache.module';
import { HealthModule } from './health/health.module';
import { Notifications } from './notifications/models/notifications.model';
import { NotificationsModule } from './notifications/notifications.module';
import { User } from './users/models/users.model';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    JwtModule.register({ global: true, privateKey: process.env.JWT_SECRET }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      dialectOptions: {
        useUTC: true,
      },
      timezone: '+00:00',
      models: [User, OTP, Analytics, Reports, Notifications],
      autoLoadModels: true,
      synchronize: true, // I activated it because its a demo project. In production, it should be false.
      logging(sql) {
        new Logger('Sequelize').log(sql);
      },
    }),
    AuthModule,
    UsersModule,
    AnalyticsModule,
    HealthModule,
    CacheModule,
    NotificationsModule,
  ],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AnalyticsInterceptor,
    },
  ],
})
export class AppModule {}
