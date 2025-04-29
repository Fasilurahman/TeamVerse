import { User } from "../../../domain/entities/User";
import { UserRepository } from "../../../infrastructure/database/repositories/UserRepository";

export class GetUserByEmailUseCase {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    async execute(email: string): Promise<User|null>{
        return await this.userRepository.findByEmail(email);
    }
}