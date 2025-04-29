import { TaskRepository } from "../../../infrastructure/database/repositories/TaskRepository";

export class GetSubtasksByUserIdUseCase {
    constructor(private taskRepository: TaskRepository){}

    async execute(userId: string){
        return await this.taskRepository.getSubtasksByUserId(userId)
    }
}