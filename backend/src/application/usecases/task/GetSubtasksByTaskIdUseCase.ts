import { TaskRepository } from "../../../infrastructure/database/repositories/TaskRepository";

export class GetSubtasksByTaskIdUseCase{
    constructor(private taskRepository: TaskRepository){}

    async execute(taskId: string){
        return this.taskRepository.getSubtasksByTaskId(taskId);
    }
}