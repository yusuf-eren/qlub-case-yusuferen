import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';

import { AnalyticsCron } from './analytics/analytics.cron';
import { AnalyticsService } from './analytics/analytics.service';
import { AnalyticsEvent } from './analytics/models/analytics.model';
import { AppModule } from './app.module';
import { Role } from './auth/interfaces/roles.interface';
import { NotificationsService } from './notifications/notifications.service';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Qlub Backoffice API')
    .setDescription(
      'The Qlub API for Backoffice Operations. User Management & Analytics Platform',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, documentFactory);

  await app.listen(process.env.APP_PORT);

  const usersService = app.get(UsersService);
  const analyticsService = app.get(AnalyticsService);
  const analyticsCron = app.get(AnalyticsCron);
  const notificationsService = app.get(NotificationsService);

  // Seeding DB For first run to let you test the application. Remove it in production.
  await seedDb(
    usersService,
    analyticsService,
    analyticsCron,
    notificationsService,
  );
}
bootstrap();

async function seedDb(
  usersService: UsersService,
  analyticsService: AnalyticsService,
  analyticsCron: AnalyticsCron,
  notificationsService: NotificationsService,
) {
  const user = await usersService.findOne({});
  if (user) {
    console.log('DB already seeded');
    return;
  }

  const generatedUsers = [];
  for (let i = 0; i < Math.floor(Math.random() * (300 - 200 + 1)) + 200; i++) {
    await usersService
      .create({
        name: `test_${i}`,
        email: `test_${i}@gmail.com`,
        password: await bcrypt.hash(`test_${i}`, 10),
        role: Math.random() > 0.5 ? Role.ADMIN : Role.USER,
        active: Math.random() > 0.5,
      })
      .then((user) => {
        generatedUsers.push(user);
      });
  }

  // Sample Admin Account
  await usersService.create({
    name: `sample_admin_account`,
    email: `sample_admin_accountt@gmail.com`,
    password: await bcrypt.hash('admin', 10),
    role: Role.ADMIN,
    active: true,
  });

  for (let i = 0; i < Math.floor(Math.random() * (300 - 200 + 1)) + 600; i++) {
    const metrics = [
      AnalyticsEvent.FAILED_LOGIN_ATTEMPT,
      AnalyticsEvent.SUCCESSFUL_LOGIN,
      AnalyticsEvent.NEW_USER,
      AnalyticsEvent.UPDATED_USER,
    ];

    const metric = metrics[Math.floor(Math.random() * metrics.length)];
    await analyticsService.create({
      userID:
        metric !== AnalyticsEvent.FAILED_LOGIN_ATTEMPT
          ? generatedUsers[Math.floor(Math.random() * generatedUsers.length)].id
          : null,
      event: metric,
      method: 'POST',
      status: Math.random() > 0.5 ? 201 : 401,
    });
  }

  // Runs for yesterday's data.
  await analyticsCron.authOperations();

  await notificationsService.createNotification({
    event: AnalyticsEvent.NEW_USER,
    interval: 60000,
    threshold: 100,
  });

  await notificationsService.createNotification({
    // new user count over 100 in an hour.
    event: AnalyticsEvent.NEW_USER,
    interval: 3600,
    threshold: 100,
  });

  await notificationsService.createNotification({
    // failed login count over 250 in a minute.
    event: AnalyticsEvent.FAILED_LOGIN_ATTEMPT,
    interval: 60,
    threshold: 250,
  });

  await notificationsService.createNotification({
    // successful login count over 500 in a minute.
    event: AnalyticsEvent.SUCCESSFUL_LOGIN,
    interval: 60,
    threshold: 500,
  });
}
