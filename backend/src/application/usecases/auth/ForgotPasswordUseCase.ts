import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { AuthService } from '../../../infrastructure/services/AuthService';
import { MESSAGES } from "../../../shared/constants/ResponseMessages";
import { STATUS_CODES } from "../../../shared/constants/statusCodes";

export class ForgotPasswordUseCase {
  constructor(private userRepository: IUserRepository, private authService: AuthService) {}

  async execute(email: string): Promise<string | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw {
        status: STATUS_CODES.NOT_FOUND,
        message: MESSAGES.USER.USER_NOT_FOUND,
      };
    };

    const otp = this.authService.generateOTP(email);
    console.log(`OTP for ${email}: ${otp}`);
    return otp;
  }
}
