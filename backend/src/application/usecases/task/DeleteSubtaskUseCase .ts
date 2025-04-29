import { TaskRepository } from "../../../infrastructure/database/repositories/TaskRepository";

export class DeleteSubtaskUseCase {
    constructor(private taskRepository: TaskRepository){}

    async execute(subtaskId : string){
        return this.taskRepository.deleteSubtask(subtaskId);
    }
}