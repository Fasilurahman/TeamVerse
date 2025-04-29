import { NotificationModel } from "../models/NotificationModel";
import { Notification } from "../../../domain/entities/Notification";
import mongoose, { Schema } from "mongoose";

export class NotificationRepository {
    async save(notification: Notification): Promise<Notification> {
        try {
        
            const newNotification = new NotificationModel({
                userId: new mongoose.Types.ObjectId(notification.userId.toString()),
                message: notification.message,
                type: notification.type,
                read: notification.read,
                createdAt: notification.createdAt || new Date()
            });
            
            await newNotification.save();
            
            
            return {
                id: newNotification._id.toString(),
                userId: notification.userId,
                message: newNotification.message,
                type: newNotification.type,
                read: newNotification.read,
                createdAt: newNotification.createdAt
            };
        } catch (error) {
            console.error('Error saving notification:', error);
            throw error;
        }
    }

    async getByUserId(userId: Schema.Types.ObjectId | string): Promise<Notification[]> {
        try {
            const searchId = typeof userId === 'string' ? 
                new mongoose.Types.ObjectId(userId) : userId;
                
            console.log(`Fetching notifications for user: ${searchId}`);
            const notifications = await NotificationModel.find({ userId: searchId }).sort({ createdAt: -1 });
            
            return notifications.map((notification) => ({
                id: notification._id.toString(),
                userId: new mongoose.Types.ObjectId(notification.userId),
                message: notification.message, 
                type: notification.type, 
                read: notification.read, 
                createdAt: notification.createdAt
            }));
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }
    
    async markAsRead(notificationId: string): Promise<void> {
        await NotificationModel.updateOne({ _id: notificationId }, { $set: { read: true } });
    }
    
    async markAllAsRead(userId: string): Promise<void> {
        await NotificationModel.updateMany({ userId: new mongoose.Types.ObjectId(userId), read: false }, { $set: { read: true } });
    }
}