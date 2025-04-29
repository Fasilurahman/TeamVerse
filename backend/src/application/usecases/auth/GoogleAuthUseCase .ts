import { GoogleAuthService } from "../../../infrastructure/services/GoogleAuthService";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { AuthService } from "../../../infrastructure/services/AuthService";
import { User } from "../../../domain/entities/User";
import { MESSAGES } from "../../../shared/constants/ResponseMessages";
import { STATUS_CODES } from "../../../shared/constants/statusCodes";

export class GoogleAuthUseCase {
  constructor(
    private userRepository: IUserRepository,
    private authService: AuthService,
    private googleAuthService: GoogleAuthService
  ) {}

  async execute(accessToken: string) {
    const googleUserData = await this.googleAuthService.getGoogleUserData(
      accessToken
    );
    if (!googleUserData || !googleUserData.sub) {
      throw new Error(MESSAGES.USER.INVALID_TOKEN_OR_USER_DATA_NOT_FOUND);
    }

    const { email, name, picture, sub } = googleUserData;
    let user = await this.userRepository.findByEmail(email);
    if (user?.isBlocked) {
      throw {
        status: STATUS_CODES.FORBIDDEN,
        message: MESSAGES.USER.USER_BLOCKED,
      };
    }

    if (!user) {
      user = await this.userRepository.save(
        new User(
          sub,
          name || "Unnamed user",
          email || "",
          "employee", 
          "",
          picture || "",
          null,
          [],
          new Date(),
          new Date(),
          false,
          null,
          null,
          null,
          "active" ,
          false,
          null,
          null,
          null,
          null,
        )
      );
    }

    const generatedAccessToken = this.authService.generateToken(user); 
    const refreshToken = this.authService.generateRefreshToken(user);

    return {
      accessToken: generatedAccessToken, 
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        role: user.role,
      },
    };
  }
}
