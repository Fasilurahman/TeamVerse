import { Notification } from "../../domain/entities/Notification";

export interface INotificationRepository {
    save(notification: Notification): Promise<Notification>;
    getByUserId(userId: string): Promise<Notification[]>;
    markAsRead(notificationId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
}
