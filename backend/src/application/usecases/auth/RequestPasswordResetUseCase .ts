import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { AuthService } from "../../../infrastructure/services/AuthService";
import { sendEmail } from "../../../infrastructure/services/EmailService";
import { MESSAGES } from "../../../shared/constants/ResponseMessages";
import { STATUS_CODES } from "../../../shared/constants/statusCodes";

export class RequestPasswordResetUseCase {
    constructor (
        private userRepository: IUserRepository,
        private authService: AuthService,
    ){}

    async execute(input: {email: string}): Promise <void>{
        const {email} = input;

        const user = await this.userRepository.findByEmail(email);
        if(!email){
            throw {
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.AUTH.EMAIL_REQUIRED
            }
        }
        if(!user?.password){
            throw {
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.USER.USER_DOES_NOT_HAVE_PASSWORD
            }
        }

        const resetToken = this.authService.generateResetToken(email);
        const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        const subject = 'Password Reset - Project Nexus';
        const message = `
            <p>Hello ${user.name},</p>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <p>
                <a href="${resetLink}" 
                style="color: #007BFF; text-decoration: none; font-size: 16px;">
                Reset your password
                </a>
            </p>
            <p>This link is valid for 15 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
            `;


        await sendEmail(email, subject, message);
    }
}