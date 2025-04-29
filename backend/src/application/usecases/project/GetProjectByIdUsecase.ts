import { Project } from "../../../domain/entities/Project";
import { ProjectRepository } from "../../../infrastructure/database/repositories/ProjectRepository";
import { MESSAGES } from "../../../shared/constants/ResponseMessages";

export class GetProjectByIdUsecase {
    private projectRepository: ProjectRepository;

    constructor(projectRepository: ProjectRepository){
        this.projectRepository = projectRepository;
    }

    async execute(id: string): Promise<Project | null>{
        if(!id) throw new Error(MESSAGES.PROJECT.INVALID_PROJECT_ID);

        return await this.projectRepository.findById(id);
    }
}