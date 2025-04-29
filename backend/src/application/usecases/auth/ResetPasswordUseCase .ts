import { AuthService } from "../../../infrastructure/services/AuthService";
import { IUserRepository } from "../../../domain/repositories/IUserRepository"; 
import { MESSAGES } from "../../../shared/constants/ResponseMessages";
import { STATUS_CODES } from "../../../shared/constants/statusCodes";

export class ResetPasswordUseCase {
    constructor(
      private authService: AuthService,
      private userRepository: IUserRepository
    ) {}
  
    async execute(input: { token: string; newPassword: string }): Promise<void> {
      const { token, newPassword } = input;
  
      const payload = this.authService.verifyResetToken(token);
      if (!payload) {
        throw {
          status: STATUS_CODES.BAD_REQUEST,
          message: MESSAGES.AUTH.INVALID_OR_EXPIRED_TOKEN,
        };
      }
  
      const { email } = payload;
  
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw {
          status: STATUS_CODES.NOT_FOUND,
          message: MESSAGES.USER.USER_NOT_FOUND,
        };
      }
  
      const hashedPassword = await this.authService.hashPassword(newPassword);
  
      await this.userRepository.updatePassword(user.id, hashedPassword);
    }
  }
  