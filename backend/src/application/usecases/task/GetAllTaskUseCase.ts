import { TaskRepository } from "../../../infrastructure/database/repositories/TaskRepository";

export class GetAllTaskUseCase {
    constructor(
        private taskRepository: TaskRepository
    ){}
    
    async execute(userId: string) {
        return this.taskRepository.getAll(userId);
    }
}