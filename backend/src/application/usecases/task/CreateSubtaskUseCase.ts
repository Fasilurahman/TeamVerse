import { Subtask } from "../../../domain/entities/Task";
import { TaskRepository } from "../../../infrastructure/database/repositories/TaskRepository";

export class CreateSubtaskUseCase {
  constructor(private taskRepository: TaskRepository){}

  async execute(subtaskData: any){
    return await this.taskRepository.createSubtask(subtaskData);
  }
}
