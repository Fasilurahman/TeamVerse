import { TaskRepository } from "../../../infrastructure/database/repositories/TaskRepository";
import { Subtask } from "../../../domain/entities/Task";

export class UpdateSubtaskUseCase {
    constructor(private taskRepository: TaskRepository){}

    async execute(taskId: string, subtaskId: string, updateData: Partial<Subtask>):Promise<Subtask | null> {
        const updatedSubtask = await this.taskRepository.updateSubtask(taskId, subtaskId, updateData);
        return updatedSubtask;
    }
}