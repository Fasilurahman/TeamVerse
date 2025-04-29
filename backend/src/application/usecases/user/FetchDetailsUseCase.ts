import { UserRepository } from "../../../infrastructure/database/repositories/UserRepository";

export class FetchDetailsUseCase {
    constructor(
        private userRepository: UserRepository,
    ){}
  
    async execute(userId: string) {
      const subscriptionDetails = await this.userRepository.fetchDetailsByUserId(userId);
      return subscriptionDetails;
    }
}