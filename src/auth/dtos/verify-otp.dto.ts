import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
}
