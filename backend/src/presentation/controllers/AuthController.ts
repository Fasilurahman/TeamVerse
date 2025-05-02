import { Request, Response, NextFunction } from "express";
import { UserRepository } from "../../infrastructure/database/repositories/UserRepository";
import { AuthService } from "../../infrastructure/services/AuthService";
import { RegisterUseCase } from "../../application/usecases/auth/RegisterUserUsecase";
import { LoginUseCase } from "../../application/usecases/auth/LoginUserUseCase";
import { ResetPasswordUseCase } from "../../application/usecases/auth/ResetPasswordUseCase";
import { ForgotPasswordUseCase } from "../../application/usecases/auth/ForgotPasswordUseCase";
import { VerifyOTPUseCase } from "../../application/usecases/auth/VerifyOTPUseCase";
import { ResendOTPUseCase } from "../../application/usecases/auth/ResendOTPUseCase";
import { RequestPasswordResetUseCase } from "../../application/usecases/auth/RequestPasswordResetUseCase ";
import { GoogleAuthUseCase } from "../../application/usecases/auth/GoogleAuthUseCase ";
import { GoogleAuthService } from "../../infrastructure/services/GoogleAuthService";
import { sendEmail } from '../../infrastructure/services/EmailService';
import { STATUS_CODES } from '../../shared/constants/statusCodes';
import { MESSAGES } from '../../shared/constants/ResponseMessages';
import { RefreshTokenUseCase } from "../../application/usecases/auth/RefreshTokenUseCase ";
import { OAuth2Client } from 'google-auth-library';

export class AuthController {
    private readonly userRepository: UserRepository;
    private readonly authService: AuthService;
    private readonly googleAuthService: GoogleAuthService;
    private readonly googleClient: OAuth2Client;

    private readonly registerUseCase: RegisterUseCase;
    private readonly loginUseCase: LoginUseCase;
    private readonly resetPasswordUseCase: ResetPasswordUseCase;
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase;
    private readonly verifyOTPUseCase: VerifyOTPUseCase;
    private readonly resendOTPUseCase: ResendOTPUseCase;
    private readonly refreshTokenUseCase: RefreshTokenUseCase;
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase;
    private readonly googleAuthUseCase: GoogleAuthUseCase;

    constructor() {
        this.userRepository = new UserRepository();
        this.authService = new AuthService();
        this.googleAuthService = new GoogleAuthService();
        this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

        this.registerUseCase = new RegisterUseCase(this.userRepository, this.authService);
        this.loginUseCase = new LoginUseCase(this.userRepository, this.authService);
        this.resetPasswordUseCase = new ResetPasswordUseCase(this.userRepository, this.authService);
        this.forgotPasswordUseCase = new ForgotPasswordUseCase(this.userRepository, this.authService);
        this.verifyOTPUseCase = new VerifyOTPUseCase(this.authService, this.userRepository);
        this.resendOTPUseCase = new ResendOTPUseCase(this.authService, sendEmail);
        this.refreshTokenUseCase = new RefreshTokenUseCase(this.userRepository, this.authService);
        this.requestPasswordResetUseCase = new RequestPasswordResetUseCase(this.userRepository, this.authService);
        this.googleAuthUseCase = new GoogleAuthUseCase(this.userRepository, this.authService, this.googleAuthService);
    }

    async signUp(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, email, password } = req.body;
            const result = await this.registerUseCase.execute(name, email, password);
            res.status(STATUS_CODES.OK).json({ result });
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            console.log('entering to login controller',email,password)
            const loginResult = await this.loginUseCase.execute(email, password);

            if (!loginResult) {
                return res.status(STATUS_CODES.UNAUTHORIZED)
                    .json({ message: MESSAGES.AUTH.INVALID_CREDENTIALS });
            }

            const { user, accessToken, refreshToken } = loginResult;

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.status(STATUS_CODES.OK).json({
                message: MESSAGES.AUTH.LOGIN_SUCCESS,
                user,
                accessToken,
                refreshToken
            });
        } catch (error) {
            console.log('error in login',error)
            next(error);
        }
    }

    async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies.refreshToken;
            const result = await this.refreshTokenUseCase.execute({ refreshToken });

            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.status(STATUS_CODES.OK).json({
                accessToken: result.accessToken,
                refreshToken: result.refreshToken
            });
        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            const otp = await this.forgotPasswordUseCase.execute(email);
            
            if (!otp) {
                return res.status(STATUS_CODES.NOT_FOUND)
                    .json({ message: MESSAGES.USER.USER_NOT_FOUND });
            }

            res.status(STATUS_CODES.OK)
                .json({ message: MESSAGES.AUTH.OTP_SENT });
        } catch (error) {
            next(error);
        }
    }

    async verifyOTP(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, otp } = req.body;
            console.log('Verifying OTP for email:', email, 'with OTP:', otp);
            const result = await this.verifyOTPUseCase.execute({
                email,
                otp,
                role: 'employee'
            });

            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.status(STATUS_CODES.OK).json({
                message: MESSAGES.AUTH.OTP_VERIFIED,
                accessToken: result.accessToken,
                user: result.user
            });
        } catch (error: any) {
            console.error('OTP verification error:', error);
            const statusCode = error.status || STATUS_CODES.BAD_REQUEST;
            const message = error.message || MESSAGES.AUTH.VERIFICATION_FAILED;
            res.status(statusCode).json({ message });
        }
    }

    async resendOTP(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            await this.resendOTPUseCase.execute({ email });
            res.status(STATUS_CODES.OK)
                .json({ message: MESSAGES.AUTH.OTP_RESEND });
        } catch (error) {
            next(error);
        }
    }

    async requestPasswordReset(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            await this.requestPasswordResetUseCase.execute({ email });
            res.status(STATUS_CODES.OK)
                .json({ message: MESSAGES.AUTH.RESET_LINK_SENT });
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { token, newPassword } = req.body;
            const payload = this.authService.verifyResetToken(token);

            if (!payload) {
                return res.status(STATUS_CODES.BAD_REQUEST)
                    .json({ message: MESSAGES.AUTH.INVALID_TOKEN });
            }

            const { email } = payload;
            const user = await this.userRepository.findByEmail(email);

            if (!user) {
                return res.status(STATUS_CODES.NOT_FOUND)
                    .json({ message: MESSAGES.USER.USER_NOT_FOUND });
            }

            const hashedPassword = await this.authService.hashPassword(newPassword);
            await this.userRepository.updatePassword(user.id, hashedPassword);

            res.status(STATUS_CODES.OK)
                .json({ message: MESSAGES.AUTH.PASSWORD_RESET_SUCCESS });
        } catch (error) {
            next(error);
        }
    }

    async googleAuth(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.body.accessToken;
            if (!token) {
                return res.status(STATUS_CODES.BAD_REQUEST)
                    .json({ message: MESSAGES.AUTH.TOKEN_REQUIRED });
            }

            const result = await this.googleAuthUseCase.execute(token);

            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.status(STATUS_CODES.OK).json({
                message: MESSAGES.AUTH.GOOGLE_AUTH_SUCCESS,
                accessToken: result.accessToken,
                user: result.user,
            });
        } catch (error) {
            console.error('Google auth error:', error);
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
          console.log('Logout request received');
            res.clearCookie('refreshToken');
            res.status(STATUS_CODES.OK)
                .json({ message: MESSAGES.AUTH.LOGOUT_SUCCESS });
        } catch (error) {
            next(error);
        }
    }
}

