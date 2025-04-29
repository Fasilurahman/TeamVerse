import { Task } from "../../../domain/entities/Task";
import { TaskRepository } from "../../../infrastructure/database/repositories/TaskRepository";
import { NotificationRepository } from "../../../infrastructure/database/repositories/NotificationRepository";
import { SocketService } from "../../../infrastructure/services/socketService";
import { SendNotificationUseCase } from "../Notification/SendNotificationUseCase";


export class CreateTaskUseCase {
  constructor(
    private taskRepository: TaskRepository,
    private notificationRepository: NotificationRepository,
    private socketService: SocketService

  ) {}

  async execute(taskData: Omit<Task, "id" | "subtasks" | "createdAt" | "updatedAt">) {
    const createdTask = await this.taskRepository.create(taskData);
    if(createdTask.assignedTo) {
      const assignedUserId = createdTask.assignedTo._id.toString();
      const sendNotificationUseCase = new SendNotificationUseCase(this.notificationRepository,this.socketService);
      const notificationMessage = `You have been assigned a new task: "${createdTask.name}".`;
      await sendNotificationUseCase.execute([assignedUserId], notificationMessage, 'task')
    }

    return createdTask;
  }
}
