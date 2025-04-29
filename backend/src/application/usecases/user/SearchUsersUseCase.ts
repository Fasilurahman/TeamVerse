import { UserRepository } from "../../../infrastructure/database/repositories/UserRepository";

export class SearchUsersUseCase {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository){
        this.userRepository = userRepository;
    }

    async execute(query: string){
        return this.userRepository.search(query)
    }
}