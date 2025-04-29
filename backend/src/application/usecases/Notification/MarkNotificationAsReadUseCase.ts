import { NotificationRepository } from "../../../infrastructure/database/repositories/NotificationRepository";
import { MESSAGES } from "../../../shared/constants/ResponseMessages";

export class MarkNotificationAsReadUseCase {
    private notificationRepository: NotificationRepository;

    constructor(notificationRepository: NotificationRepository){
        this.notificationRepository = notificationRepository;
    }

    async execute(notificationId: string): Promise<void>{
        if(!notificationId) throw new Error(MESSAGES.NOTIFICATION.NOTIFICATIONID_REQUIRED);

        await this.notificationRepository.markAsRead(notificationId)
    }
}