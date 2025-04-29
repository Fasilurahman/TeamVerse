import { AuthService } from "../../../infrastructure/services/AuthService";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { STATUS_CODES } from "../../../shared/constants/statusCodes";
import { User } from "../../../domain/entities/User";
import { MESSAGES } from "../../../shared/constants/ResponseMessages";

export class VerifyOTPUseCase {
  constructor(
    private authService: AuthService,
    private userRepository: IUserRepository
  ){}

  async execute(input: { email: string; otp: string; role: string }): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }> {
    console.log('1')
    const { email, otp, role } = input;
    if(!email || !otp){
      throw {
        status: 400,
        message: MESSAGES.AUTH.EMAIL_AND_OTP_REQUIRED
      }
    }
    console.log('2')
    
    const userDetails = this.authService.verifyOTP(email, otp);
    console.log(userDetails,'3')
    if(!userDetails){
      throw {
        status: STATUS_CODES.BAD_REQUEST,
        message: MESSAGES.AUTH.OTP_INVALID
      }
    }
    console.log('4')
    
    const hashedPassword = await this.authService.hashPassword(userDetails.password);
    console.log('5')
    
    const newUser = await this.userRepository.save(
      new User(
        "",                         
       userDetails.name,                         
       userDetails.email,                        
       "employee",               
       hashedPassword,            
       "",                          
       null,                         
       null,                      
       new Date(),               
       new Date(),         
       false,                       
       null,                    
       null,                 
       null ,                     
       "active", 
       false, 
       null, 
       null, 
       null, 
       null                  
      )
     );

     console.log('5')
     const accessToken = this.authService.generateToken(newUser);
     console.log('6')
     const refreshToken = this.authService.generateRefreshToken(newUser);
     console.log('7')
     console.log(accessToken, refreshToken, 'tokens')
     return {
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
     }
    }
  }
}