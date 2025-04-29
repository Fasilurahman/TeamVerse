import { User } from '../entities/User';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
  updatePassword(id: string, newPassword: string): Promise<void>;
  update(email: string, data: Partial<User>): Promise<User | null>;
  findAll(): Promise<User[]>;
  updateUserProfile(email: string, updateData: Partial<User>): Promise<User | null>;
  getTeamMembers(teamId: string): Promise<User[]>;
  search(query: string): Promise<User[]>;
}
