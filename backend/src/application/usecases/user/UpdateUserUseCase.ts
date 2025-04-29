import { UserRepository } from "../../../infrastructure/database/repositories/UserRepository"
import { User } from "../../../domain/entities/User"

interface UpdateUserRequest {
    email: string;
    name?: string;
    location?: string;
    phone?: string;
    profilePic?: string;
  }

export class UpdateUserUseCase {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository
    }

    async execute(request: UpdateUserRequest): Promise<User | null> {
        const { email, name, location, phone, profilePic } = request;
    
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
          throw new Error("User not found");
        }
    
        const updateData: Partial<User> = {};
        if (name) updateData.name = name;
        if (location) updateData.location = location;
        if (phone) updateData.phone = phone;
        if (profilePic) updateData.profilePic = profilePic;
    
        return await this.userRepository.updateUserProfile(email, updateData);
      }
}