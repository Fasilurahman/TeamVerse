import { TaskRepository } from "../../../infrastructure/database/repositories/TaskRepository";

export class GetTasksByUserIdUseCase {
    constructor(private taskRepository: TaskRepository){}

    async execute(userId: string){
        return this.taskRepository.getTasksByUserId(userId);
    }
}