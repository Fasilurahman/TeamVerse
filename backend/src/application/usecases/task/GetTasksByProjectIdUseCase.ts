import { TaskRepository } from '../../../infrastructure/database/repositories/TaskRepository'
import { Task } from '../../../domain/entities/Task'
import { MESSAGES } from '../../../shared/constants/ResponseMessages';
import logger from '../../../infrastructure/logging/logger';

export class GetTasksByProjectIdUseCase {
    constructor(private taskRepository: TaskRepository){}

    async execute(projectId: string): Promise<Task[]>{
        if(!projectId){
            throw new Error(MESSAGES.PROJECT.INVALID_PROJECT_ID);
        }
        return await this.taskRepository.findByProjectId(projectId);
    }
}