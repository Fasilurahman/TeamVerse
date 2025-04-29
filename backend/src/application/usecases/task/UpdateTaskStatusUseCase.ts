import { TaskRepository } from "../../../infrastructure/database/repositories/TaskRepository";

export class UpdateTaskStatusUseCase {
    constructor(
        private taskRepository: TaskRepository
    ){}

    async execute(taskId: string, status: string, sprintId: string){
        return await this.taskRepository.updateTaskStatus(taskId, status, sprintId);
    }

}