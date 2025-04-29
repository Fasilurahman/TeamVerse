import { Request, Response, NextFunction } from "express";
import { NotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";
import { GetNotificationsUseCase } from '../../application/usecases/Notification/GetNotificationsUseCase';
import { MarkNotificationAsReadUseCase } from '../../application/usecases/Notification/MarkNotificationAsReadUseCase';
import { MarkAllNotificationsAsReadUseCase } from '../../application/usecases/Notification/MarkAllNotificationsAsReadUseCase';
import { STATUS_CODES } from "../../shared/constants/statusCodes";
import { MESSAGES } from "../../shared/constants/ResponseMessages";

export class NotificationController {
    private readonly notificationRepository: NotificationRepository;
    private readonly getNotificationsUseCase: GetNotificationsUseCase;
    private readonly markNotificationAsReadUseCase: MarkNotificationAsReadUseCase;
    private readonly markAllNotificationsAsReadUseCase: MarkAllNotificationsAsReadUseCase;

    constructor() {
        this.notificationRepository = new NotificationRepository();
        this.getNotificationsUseCase = new GetNotificationsUseCase(this.notificationRepository);
        this.markNotificationAsReadUseCase = new MarkNotificationAsReadUseCase(this.notificationRepository);
        this.markAllNotificationsAsReadUseCase = new MarkAllNotificationsAsReadUseCase(this.notificationRepository);
    }

    async getNotification(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            const notifications = await this.getNotificationsUseCase.execute(userId);
            res.status(STATUS_CODES.OK).json(notifications);
        } catch (error) {
            next(error);
        }
    }

    async markAsRead(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await this.markNotificationAsReadUseCase.execute(id);
            res.status(STATUS_CODES.OK).json({
                message: MESSAGES.NOTIFICATION.NOTIFICATION_MARKED_AS_READ
            });
        } catch (error) {
            next(error);
        }
    }

    async markAllAsRead(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            await this.markAllNotificationsAsReadUseCase.execute(userId);
            res.status(STATUS_CODES.OK).json({
                message: MESSAGES.NOTIFICATION.NOTIFICATIONS_MARKED_AS_READ
            });
        } catch (error) {
            next(error);
        }
    }
}

