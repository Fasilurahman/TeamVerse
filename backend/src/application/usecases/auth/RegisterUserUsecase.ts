// src/application/usecases/auth/RegisterUserUsecase.ts
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { User } from "../../../domain/entities/User";
import { AuthService } from "../../../infrastructure/services/AuthService";
import { sendEmail } from "../../../infrastructure/services/EmailService";
import { MESSAGES } from "../../../shared/constants/ResponseMessages";

export class RegisterUseCase {
  constructor(
    private userRepository: IUserRepository,
    private authService: AuthService
  ) {}

  async execute(name: string, email: string, password: string): Promise<{ message: string }> {

    if (!name || !email || !password) {
            
      throw new Error(MESSAGES.GENERAL.REQUIRED_FIELDS,);
    }

    const existingUser = await this.userRepository.findByEmail(email);
    console.log(existingUser);
    
    if (existingUser){
      throw new Error(MESSAGES.USER.USER_ALREADY_EXISTS);
    }

    const otp = this.authService.generateOTP(email);
    console.log(`OTP for ${email}: ${otp}`);
    
    const hashedPassword = await this.authService.hashPassword(password);
    console.log(hashedPassword,'hashed password');
    
    
    const user = new User(
      "",                         
      name,                         
      email,                        
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
    );

    this.authService.storeUserDetailsWithOTP(email, { name, email, password });

    const subject = 'Your OTP for Project Nexus';
    const message = `Hello ${name},\n\nYour OTP for verifying your account is: ${otp}\nThis OTP is valid for 5 minutes.\n\nThank you, Project Nexus Team`;

    await sendEmail(email, subject, message);


    return { message: 'OTP sent successfully'}
  }
}
