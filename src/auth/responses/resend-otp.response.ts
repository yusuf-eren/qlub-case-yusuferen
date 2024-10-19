import { ApiResponseProperty } from '@nestjs/swagger';

export class ResendOtpResponse {
  @ApiResponseProperty()
  message: string;
}
