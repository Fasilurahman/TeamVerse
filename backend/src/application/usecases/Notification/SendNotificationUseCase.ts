import { NotificationRepository } from "../../../infrastructure/database/repositories/NotificationRepository";
import { SocketService } from "../../../infrastructure/services/socketService";
import { Notification } from "../../../domain/entities/Notification";
import { Types } from "mongoose";

// Define allowed notification types
type NotificationType = "project" | "task" | "general" | "chat";

export class SendNotificationUseCase {
    private notificationRepository: NotificationRepository;
    private socketService: SocketService;

    constructor(notificationRepository: NotificationRepository, socketService: SocketService) {
        this.notificationRepository = notificationRepository;
        this.socketService = socketService;
    }

    async execute(userIds: string[], message: string, type: NotificationType) {
        console.log('entering to send notification usecases',userIds)
        const results = [];
        
        for (const userId of userIds) {
            if (!userId || !Types.ObjectId.isValid(userId)) {
                console.error(`Invalid userId: ${userId}`);
                continue; 
            }
            
            try {
                
                const objectId = new Types.ObjectId(userId);
                const notification = new Notification(objectId, message, type, false);

                const savedNotification = await this.notificationRepository.save(notification);

                this.socketService.sendNotification(userId, savedNotification);
                
                results.push(savedNotification);
            } catch (error) {
                console.error(`Failed to send notification to user ${userId}:`, error);
            }
        }
        
        return results;
    }
}