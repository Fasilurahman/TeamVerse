import { TeamRepository } from "../../../infrastructure/database/repositories/TeamRepository";
import { Team } from "../../../domain/entities/Team";

export class GetTeamByIdUseCase{
    constructor(private teamRepository: TeamRepository){}

    async execute(id: string): Promise<Team | null>{
        return await this.teamRepository.findById(id);
    }
}