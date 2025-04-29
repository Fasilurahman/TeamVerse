import { AuthService } from "../../../infrastructure/services/AuthService";
import { sendEmail } from "../../../infrastructure/services/EmailService";
import { MESSAGES } from "../../../shared/constants/ResponseMessages";
import { STATUS_CODES } from "../../../shared/constants/statusCodes";


export class ResendOTPUseCase {
    constructor(
        private authservice: AuthService,
        private emailService: typeof sendEmail
    ){}

    async execute(input: {email: string}): Promise<void>{
        const {email} = input;
        if(!email){
            throw {
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.AUTH.EMAIL_REQUIRED
            }
        }

        const userDetails = this.authservice.getUserDetailsByEmail(email);
        if(!userDetails){
            throw {
                status: STATUS_CODES.NOT_FOUND,
                message: MESSAGES.USER.USER_NOT_FOUND
            }
        }

        const otp = this.authservice.generateOTP(email);
        console.log(`OTP for ${email}: ${otp}`);

        const subject = 'Resend OTP - Project Nexus';
        const message = `Hello ${userDetails.name},\n\nYour OTP is: ${otp}\nThis OTP is valid for 5 minutes.\n\nThank you, Project Nexus Team`;
    
        await this.emailService(email, subject, message);

    }
}