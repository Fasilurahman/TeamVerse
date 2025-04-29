import { TaskRepository } from "../../../infrastructure/database/repositories/TaskRepository";

export class DeleteTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(id: string): Promise<boolean> {
    return await this.taskRepository.delete(id);
  }
}
