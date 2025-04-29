import { UserRepository } from "../../../infrastructure/database/repositories/UserRepository";

export class GetAllUsersUseCase {
    constructor(private userRepository: UserRepository) {}

    async execute() {
        return await this.userRepository.findAll();
    }
}