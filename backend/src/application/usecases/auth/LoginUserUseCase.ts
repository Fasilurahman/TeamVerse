import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { AuthService} from '../../../infrastructure/services/AuthService'
import { MESSAGES } from "../../../shared/constants/ResponseMessages";
import { createError } from "../../../middleware/errorHandler";

export class LoginUseCase{
    constructor(
        private userRepository: IUserRepository,
        private authService: AuthService
    ){}

    async execute(email: string, password: string): Promise<{user: any, accessToken: string; refreshToken: string } | null>{
        if (!email || !password) {
            throw {
                statusCode: 400,
                message: MESSAGES.GENERAL.REQUIRED_FIELDS
            }
           
        }
        const user = await this.userRepository.findByEmail(email);
        console.log(user,'user')
        if(!user) {
            throw {
                statusCode: 404,
                message: MESSAGES.USER.USER_NOT_FOUND
            }
        }
        if(user.isBlocked){
            throw {
                statusCode: 403,
                message: MESSAGES.USER.USER_BLOCKED
            }
        }
        if (!user.password) {
            throw {
                statusCode: 400,
                message: MESSAGES.USER.USER_DOES_NOT_HAVE_PASSWORD
            }
        }
        const isPasswordValid = await this.authService.comparePasswords(password,user.password);
        if (!isPasswordValid) {
            console.log('password is matching')
            throw {
                statusCode: 400,
                message: MESSAGES.AUTH.PASSWORD_MISMATCH
            }
        }
        const accessToken = this.authService.generateToken(user);
        const refreshToken = this.authService.generateRefreshToken(user);
        return {user,accessToken,refreshToken}
    }
}