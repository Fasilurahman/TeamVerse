import express from "express";
import { ChatController } from "../controllers/ChatController";
import { authMiddleware } from "../../middleware/authMiddleware";
import { chatUpload } from "../../infrastructure/fileStorage/multerConfig";

const router = express.Router();
const chatController = new ChatController();

router.get('/project/:projectId', chatController.getChatByProject.bind(chatController));
router.get('/user/:userId', chatController.getUserChats.bind(chatController));
router.get('/:chatId/messages', chatController.getChatMessages.bind(chatController));
router.post('/:chatId/messages',authMiddleware,chatUpload(), chatController.sendMessage.bind(chatController));

export default router;