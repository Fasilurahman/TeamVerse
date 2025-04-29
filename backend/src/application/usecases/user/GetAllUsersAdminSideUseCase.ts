import { UserRepository } from "../../../infrastructure/database/repositories/UserRepository";


export class GetAllUsersAdminUseCase {
    constructor(private userRepository: UserRepository) {}
  
    async execute(page: number, limit: number) {
      return await this.userRepository.findAllUsers(page, limit);
    }
  }
  