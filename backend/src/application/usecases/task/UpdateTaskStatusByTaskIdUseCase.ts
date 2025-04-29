import { TaskRepository } from "../../../infrastructure/database/repositories/TaskRepository";

export class UpdateTaskStatusByTaskIdUseCase {
    constructor(
        private taskRepository: TaskRepository
    ){}

    async execute(taskId: string, status: string){
        console.log(taskId, status, 'taskId and status in usecase')
        return await this.taskRepository.updateTaskStatusByTaskId(taskId, status);
    }
}
