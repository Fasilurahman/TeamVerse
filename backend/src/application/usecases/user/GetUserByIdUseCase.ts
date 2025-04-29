import { UserRepository } from "../../../infrastructure/database/repositories/UserRepository"


export class GetUserByIdUseCase {
    constructor(
        private readonly userRepository: UserRepository,
    ){}

    async execute(id: string) {
        return await this.userRepository.findUserById(id)
    }
}