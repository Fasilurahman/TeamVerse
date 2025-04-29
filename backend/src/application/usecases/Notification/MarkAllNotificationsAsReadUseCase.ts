import { NotificationRepository } from '../../../infrastructure/database/repositories/NotificationRepository';
import { MESSAGES } from '../../../shared/constants/ResponseMessages';

export class MarkAllNotificationsAsReadUseCase {
    private notificationRepository: NotificationRepository;

    constructor(notificationRepository: NotificationRepository){
        this.notificationRepository = notificationRepository;
    }

    async execute(userId: string): Promise<void>{
        if(!userId) throw new Error(MESSAGES.USER.USERID_REQUIRED);

        await this.notificationRepository.markAllAsRead(userId)
    }
}