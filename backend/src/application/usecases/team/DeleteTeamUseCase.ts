import { TeamRepository } from "../../../infrastructure/database/repositories/TeamRepository";

export class DeleteTeamUseCase{
    constructor(private teamRepository: TeamRepository){}

    async execute(id: string): Promise<Boolean>{
        return await this.teamRepository.delete(id)
    }
}
