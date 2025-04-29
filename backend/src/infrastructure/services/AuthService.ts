import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {User} from '../../domain/entities/User'
import { UserRepository } from "../database/repositories/UserRepository";

interface UserDetails {
    name: string;
    email: string;
    password: string;
    
}

type OTPRecord = {
    otp: string;
    expires: number;
    userDetails?: UserDetails;
}

const userRepository = new UserRepository();

const JWT_SECRET = process.env.JWT_SECRET || "Nothing";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "NothingRefresh";
const RESET_PASSWORD_SECRET = process.env.RESET_PASSWORD_SECRET || "reset_secret";

const otpStore: Map<
    string,
    { otp: string; expires: number; userDetails?: { name: string; email: string; password: string } }
> = new Map();

export class AuthService {
    async hashPassword(password: string): Promise<string>{
        return await bcrypt.hash(password, 10);
    }

    async comparePasswords(password: string, hashed: string): Promise<boolean>{
        return bcrypt.compare(password, hashed);
    }

    generateToken(user: User): string{
        
        return jwt.sign(
            {
                id: user.id,email: user.email,role: user.role,isBlocked: user.isBlocked,
            },
            JWT_SECRET,
            {expiresIn: '1hr'}
        )
    }

    generateRefreshToken(user: User): string{
        return jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role,
            isBlocked: user.isBlocked,
        },REFRESH_TOKEN_SECRET,{ expiresIn: '7d'})
    }

    verifyToken(token: string): any{
        return jwt.verify(token, JWT_SECRET);
    }

    verifyOTP(email: string, otp: string): UserDetails | null {
        const record = otpStore.get(email);
        console.log(record, 'record')
        if (!record) return null;
        if (Date.now() > record.expires) {
            otpStore.delete(email);
            return null;
        }
        if (record.otp === otp) {
            const userDetails = record.userDetails || null;
            otpStore.delete(email); // OTP is cleared here
            return userDetails;
        }
        console.log('recoord findished')
        return null;
      }

      storeUserDetailsWithOTP(email: string, userDetails: UserDetails): void {
        const record = otpStore.get(email);
        if (record) {
            record.userDetails = userDetails;
            otpStore.set(email, record);
        }else {
            otpStore.set(email, { otp: '', expires: 0, userDetails });
        }
    }

    getUserDetailsByEmail(email: string): UserDetails | null {
        const record = otpStore.get(email);
        return record?.userDetails || null;
    }

    generateOTP(email: string): string {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + 5 * 60 * 1000;
        const record = otpStore.get(email);
        if (record) {
            record.otp = otp;
            record.expires = expires;
            otpStore.set(email, record);
        } else {
            otpStore.set(email, { otp, expires, userDetails: undefined });
        }
        return otp;
    }

    generateResetToken(email: string):string{
        return jwt.sign(
            {email},
            RESET_PASSWORD_SECRET || 'your_reset_token_secret',
            { expiresIn: '15m'}
        )
    }

    verifyResetToken(token: string): {email: string} | null {
        try {
            return jwt.verify(token, RESET_PASSWORD_SECRET) as {email: string};
        } catch (error) {
            return null
        }
    }

    async resetPassword(email: string, newPassword: string): Promise<boolean>{
        const hashedPassword = await this.hashPassword(newPassword)

        const user = await userRepository.findByEmail(email);
        if(! user){
            return false
        }
        user.password = hashedPassword;
        await userRepository.updatePassword(user.id, hashedPassword);
        return true;
    }
    
}





