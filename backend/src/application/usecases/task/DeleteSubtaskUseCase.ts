import { TaskRepository } from "../../../infrastructure/database/repositories/TaskRepository";

export class DeleteSubtaskUseCase {
    constructor(private taskRepository: TaskRepository) {}

    async execute(subtaskId: string) {
        return await this.taskRepository.deleteSubtask(subtaskId);
    }
}
