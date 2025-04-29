import { Project } from "../../../domain/entities/Project";
import { ProjectRepository } from "../../../infrastructure/database/repositories/ProjectRepository";
import logger from "../../../infrastructure/logging/logger";
import { MESSAGES } from "../../../shared/constants/ResponseMessages";

export class GetAllProjectsUseCase {
    constructor(private projectRepository: ProjectRepository) {}

    async execute(userId: string): Promise<Project[]> {
        if(!userId){
            throw new Error(MESSAGES.USER.INVALID_USER_ID);
        }
        return await this.projectRepository.findAll(userId);
    }
}