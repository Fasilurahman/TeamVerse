import express from 'express';
import {SubscriptionController} from '../controllers/SubscriptionController';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = express.Router();
const subscriptionController = new SubscriptionController();
router.get('/', subscriptionController.getAllSubscriptions.bind(subscriptionController));
router.post('/', subscriptionController.createSubscription.bind(subscriptionController));
router.put('/:id', subscriptionController.updateSubscription.bind(subscriptionController));
router.delete('/:id', subscriptionController.deleteSubscription.bind(subscriptionController));
router.post("/create-checkout-session", authMiddleware,subscriptionController.createCheckoutSession.bind(subscriptionController));
router.get('/receipt', subscriptionController.getReceipt.bind(subscriptionController));
export default router;