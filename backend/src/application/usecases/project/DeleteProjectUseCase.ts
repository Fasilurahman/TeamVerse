import { ProjectRepository } from "../../../infrastructure/database/repositories/ProjectRepository";
import { Types } from "mongoose";
import { MESSAGES } from "../../../shared/constants/ResponseMessages";
import logger from "../../../infrastructure/logging/logger";

export class DeleteProjectUseCase{
    constructor(private projectRepository: ProjectRepository){}

    async execute(projectId: string): Promise<void>{
        if(!Types.ObjectId.isValid(projectId)){
            throw new Error(MESSAGES.PROJECT.INVALID_PROJECT_ID);
        }
        await this.projectRepository.delete(projectId);
    }
}