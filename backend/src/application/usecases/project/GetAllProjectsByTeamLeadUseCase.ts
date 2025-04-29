import { ProjectRepository } from "../../../infrastructure/database/repositories/ProjectRepository";
import { Project} from '../../../domain/entities/Project'

export class GetAllProjectsByTeamLeadUseCase {
    constructor(private projectRepository: ProjectRepository) {}

    async execute(teamLeadId: string): Promise<Project[]>{
        return await this.projectRepository.getProjectsByTeamLead(teamLeadId);
    }
}