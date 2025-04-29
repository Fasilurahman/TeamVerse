import { TaskRepository } from "../../../infrastructure/database/repositories/TaskRepository";
import { Task } from "../../../domain/entities/Task";

export class GetBacklogsByProjectIdUseCase {
    constructor(private taskRepository: TaskRepository) {}
  
    async execute(projectId: string): Promise<Task[]> {
        return await this.taskRepository.findBacklogTasksByProjectId(projectId);
    }
}