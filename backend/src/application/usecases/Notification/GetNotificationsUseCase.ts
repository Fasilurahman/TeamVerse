import { NotificationRepository } from "../../../infrastructure/database/repositories/NotificationRepository";
import { Notification } from "../../../domain/entities/Notification";
import { MESSAGES } from "../../../shared/constants/ResponseMessages";

export class GetNotificationsUseCase {
    private notificationRepository: NotificationRepository;

    constructor(notificationRepository: NotificationRepository){
        this.notificationRepository = notificationRepository;
    }

    async execute(userId: string):Promise<Notification[]>{
        if (!userId) throw new Error(MESSAGES.USER.USERID_REQUIRED);
        
        return await this.notificationRepository.getByUserId(userId);
    }

}