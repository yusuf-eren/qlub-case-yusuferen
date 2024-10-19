import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RateLimit } from 'src/auth/decorators/rate-limiter.decorator';
import { RateLimiterInterceptor } from 'src/auth/interceptors/rate-limiter.interceptor';

import { AuthService } from './auth.service';
import { Roles, User } from './decorators';
import { SignUpDto, VerifyOtpDto, SignInDto } from './dtos';
import { AuthGuard, RolesGuard } from './guards';
import { Role } from './interfaces/roles.interface';
import { SigninResponse, SignupResponse, VerifyOtpResponse } from './responses';
import { ResendOtpResponse } from './responses/resend-otp.response';
import { IUserJwt } from '../users/interfaces/users.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({ type: SigninResponse })
  @RateLimit(5, 15 * 60)
  @UseInterceptors(RateLimiterInterceptor)
  @Post('signin')
  async signIn(@Body() signInDto: SignInDto): Promise<SigninResponse> {
    return this.authService.signIn(signInDto);
  }

  @ApiResponse({ type: SignupResponse })
  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto): Promise<SignupResponse> {
    return this.authService.signUp(signUpDto);
  }

  @ApiResponse({ type: VerifyOtpResponse })
  @ApiBearerAuth()
  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Post('verify-otp')
  async verifyToken(
    @User() user: IUserJwt,
    @Body() verifyOtpDto: VerifyOtpDto,
  ): Promise<VerifyOtpResponse> {
    return this.authService.verifyOTP(user.id, verifyOtpDto.otp);
  }

  @ApiResponse({ type: ResendOtpResponse })
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(AuthGuard, RolesGuard)
  @Post('resend-otp')
  async resendOtp(@User() user: IUserJwt): Promise<ResendOtpResponse> {
    return this.authService.resendOTP(user.id);
  }
}
