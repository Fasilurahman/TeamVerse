import express from 'express'
import { NotificationController } from '../controllers/NotificationController'
const router = express.Router()
const notificationController = new NotificationController()
router.get('/:userId', notificationController.getNotification.bind(notificationController));
router.patch('/:id/read', notificationController.markAsRead.bind(notificationController));
router.patch('/:userId/read-all', notificationController.markAllAsRead.bind(notificationController));

export default router;