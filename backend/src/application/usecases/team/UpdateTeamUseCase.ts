import { TeamRepository } from "../../../infrastructure/database/repositories/TeamRepository";
import { Team } from '../../../domain/entities/Team'

export class UpdateTeamUseCase {
    constructor(private teamRepository: TeamRepository) {}

    async execute(id: string, updateData: Partial<Team>): Promise<Team | null>{
        return this.teamRepository.update(id, updateData)
    }
}