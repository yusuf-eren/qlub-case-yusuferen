import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CacheService } from 'src/cache/cache.service';
import { User } from 'src/users/models/users.model';
import { UsersService } from 'src/users/users.service';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RateLimiterInterceptor } from './interceptors/rate-limiter.interceptor';
import { OTP } from './models/otp.model';

@Module({
  imports: [SequelizeModule.forFeature([User, OTP])],
  providers: [AuthService, UsersService, RateLimiterInterceptor, CacheService],
  controllers: [AuthController],
})
export class AuthModule {}
