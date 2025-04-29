import { TeamRepository } from '../../../infrastructure/database/repositories/TeamRepository';

export class FetchTeamMembersUsecase {

  constructor(
    private teamRepository: TeamRepository, 
  ) {}

  async execute(userId: string): Promise<any[]> {
    return await this.teamRepository.findTeamsByUserId(userId);
  }
}
