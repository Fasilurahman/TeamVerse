import { UserRepository } from "../../../infrastructure/database/repositories/UserRepository";

export class BlockUserUseCase {
    constructor(private userRepository: UserRepository) {}
  
    async execute(userId: string) {
      const user = await this.userRepository.findById(userId);
  
      if (!user) {
        throw new Error("User not found");
      }
  
      user.isBlocked = !user.isBlocked; 
      return await this.userRepository.update(user.id, { isBlocked: user.isBlocked });
    }
  }
  
