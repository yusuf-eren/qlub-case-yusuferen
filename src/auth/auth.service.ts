import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';

import { SignInDto, SignUpDto } from './dtos';
import { UsersService } from '../users/users.service';
import { Role } from './interfaces/roles.interface';
import { OTP } from './models/otp.model';
import { IUser } from '../users/interfaces/users.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectModel(OTP) private otpModel: typeof OTP,
  ) {}

  async signIn(signInDto: SignInDto) {
    const user = await this.usersService.findOne({
      email: signInDto.email,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.active) {
      throw new UnauthorizedException('User is not active');
    }

    const isPasswordValid = await this.comparePassword(
      signInDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    const response = user.toJSON();

    return {
      ...response,
      token: this.jwtToken(response),
    };
  }

  async signUp(signUpDto: SignUpDto) {
    const { password, ...rest } = signUpDto;
    const hashedPassword = await this.hashPassword(password);
    const isEmailExists = await this.usersService.findOne({
      email: rest.email,
    });

    if (isEmailExists) {
      throw new BadRequestException('Email already exists');
    }

    const user = await this.usersService.create({
      email: rest.email,
      name: rest.name,
      role: Role.USER,
      password: hashedPassword,
      active: false,
    });

    /*
    As you mentoined, I don't need to send otp to user's email.
    So, I will create an OTP record and return in the response.
    I know that's not a way to do it, but I'm doing it for the sake of this example
    because I have no other option.
    */
    const otp = await this.otpModel.create({
      userID: user.id,
      expiry: new Date(Date.now() + 60 * 1000),
      otp: this.generateOTP(),
    });

    const response = user.toJSON();

    return {
      ...response,
      otp,
      token: this.jwtToken(response),
    };
  }

  async verifyOTP(userID: number, otp: string) {
    const otpRecord = await this.otpModel.findOne({
      where: { userID },
    });

    if (!otpRecord) {
      throw new NotFoundException('OTP record not found');
    }

    if (otpRecord.expiry < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    if (otpRecord.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    await this.otpModel.destroy({
      where: { id: otpRecord.id },
    });

    await this.usersService.update(userID, { active: true });

    const user = await this.usersService.findOne({ id: userID });
    const response = user.toJSON();

    return {
      ...response,
      token: this.jwtToken(response),
    };
  }

  async resendOTP(userID: number) {
    const existingOtp = await this.otpModel.findOne({
      where: { userID },
    });

    if (existingOtp && existingOtp.expiry > new Date()) {
      throw new BadRequestException('OTP already sent');
    } else if (existingOtp) {
      await this.otpModel.destroy({
        where: { id: existingOtp.id },
      });
    }

    await this.otpModel.create({
      userID,
      expiry: new Date(Date.now() + 60 * 1000),
      otp: this.generateOTP(),
    });

    return { message: 'OTP sent' };
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  private async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  private generateOTP(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  private jwtToken(user: IUser): string {
    return this.jwtService.sign(
      { ...user },
      {
        expiresIn: process.env.JWT_EXPIRATION_TIME,
      },
    );
  }
}
