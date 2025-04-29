import jwt from 'jsonwebtoken';
import { AuthService } from '../../../infrastructure/services/AuthService';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { STATUS_CODES } from '../../../shared/constants/statusCodes';
import { MESSAGES } from '../../../shared/constants/ResponseMessages';

export class RefreshTokenUseCase {
    constructor(
        private userRepository: IUserRepository,
        private authService: AuthService
    ) {}

    async execute(input:{refreshToken: string}) {
   
    const {refreshToken} = input

    if (!refreshToken) {
      throw {
        status: STATUS_CODES.UNAUTHORIZED,
        message: MESSAGES.AUTH.MISSING_REFRESH_TOKEN,
      };
    }

    let decoded: any;
    
    try {
        decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret'
        );
    } catch (error) {
        throw {
            status: STATUS_CODES.UNAUTHORIZED,
            message: MESSAGES.AUTH.INVALID_OR_EXPIRED_OTP,
        };
    }
    const user = await this.userRepository.findByEmail(decoded.email);
    if(!user){
        throw {
            status: STATUS_CODES.UNAUTHORIZED,
            message: MESSAGES.AUTH.USER_NOT_FOUND,
        }
    }

    const newAccessToken = this.authService.generateToken(user);
    const newRefreshToken = this.authService.generateRefreshToken(user);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  
}
}