import { Task } from "../../../domain/entities/Task";
import { TaskRepository } from "../../../infrastructure/database/repositories/TaskRepository";
import { NotificationRepository } from "../../../infrastructure/database/repositories/NotificationRepository";
import { SocketService } from "../../../infrastructure/services/socketService";
import { SendNotificationUseCase } from "../Notification/SendNotificationUseCase";
import { MESSAGES } from "../../../shared/constants/ResponseMessages";

export class UpdateTaskUseCase {
    constructor(
        private taskRepository: TaskRepository,
        private notificationRepository: NotificationRepository,
        private socketService: SocketService
    ){}

    async execute(taskId: string, updatedTaskData: Partial<Task>){
        if(!taskId) throw new Error(MESSAGES.TASK.INVALID_TASK_ID);

        const updatedTask = await this.taskRepository.update(taskId, updatedTaskData)

        if (!updatedTask) {
            throw new Error(MESSAGES.TASK.TASK_NOT_FOUND);
        }
        console.log(updatedTask,'updatedTask')

        const assignedUserId = updatedTask.assignedTo
        console.log(assignedUserId, 'assignedUserId')
        const sendNotificationUseCase = new SendNotificationUseCase(this.notificationRepository,this.socketService);
        const notificationMessage = `Your assigned task "${updatedTask.name}" has been updated.`;
        await sendNotificationUseCase.execute([assignedUserId], notificationMessage, "task");
        
        if(!updatedTaskData){
            throw new Error(MESSAGES.TASK.TASK_NOT_FOUND);
        }
        return updatedTask;
    }
}
