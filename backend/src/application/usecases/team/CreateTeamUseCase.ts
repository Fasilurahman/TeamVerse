import { TeamRepository } from "../../../infrastructure/database/repositories/TeamRepository";
import { Team } from "../../../domain/entities/Team";

export class CreateTeamUseCase {
  constructor(private teamRepository: TeamRepository) {}

  async execute(name: string, teamLeadId: string, members: string[] = [], projectIds: string[] = []): Promise<Team> {
    return await this.teamRepository.create({ name, teamLeadId, members });
  }
}
