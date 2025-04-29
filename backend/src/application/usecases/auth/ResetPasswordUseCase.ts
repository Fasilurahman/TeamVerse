import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { AuthService } from '../../../infrastructure//services/AuthService'

export class ResetPasswordUseCase{
    constructor(
        private useRepository: IUserRepository,
        private authService: AuthService
    ){}

    async execute(email: string, newPassword:string):Promise<boolean>{
        const user = await this.useRepository.findByEmail(email);
        if(!user)return false
        const hashed = await this.authService.hashPassword(newPassword);
        await this.useRepository.updatePassword(user.id,hashed)
        return true;
    }
}

