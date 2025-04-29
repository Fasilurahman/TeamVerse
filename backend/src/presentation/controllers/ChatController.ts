import { Request,Response, NextFunction } from "express";
import { STATUS_CODES } from "../../shared/constants/statusCodes";
import { ChatRepository } from "../../infrastructure/database/repositories/ChatRepository";
import { MessageRepository } from "../../infrastructure/database/repositories/MessageRepository";
import { GetChatByProjectUseCase } from "../../application/usecases/chat/GetChatByProjectUseCase";
import { GetChatMessagesUseCase } from "../../application/usecases/message/GetChatMessagesUseCase";
import { SendMessageUseCase } from "../../application/usecases/message/SendMessageUseCase";
import { GetUserChatsUseCase } from "../../application/usecases/chat/GetUserChatsUseCase";
import { SocketService } from "../../infrastructure/services/socketService";
import { MESSAGES } from "../../shared/constants/ResponseMessages";
import { SendNotificationUseCase } from '../../application/usecases/Notification/SendNotificationUseCase';
import { NotificationRepository } from '../../infrastructure/database/repositories/NotificationRepository';

export class ChatController {
    private readonly chatRepository: ChatRepository;
    private readonly messageRepository: MessageRepository;
    private readonly getChatUseCase: GetChatByProjectUseCase;
    private readonly getChatMessagesUseCase: GetChatMessagesUseCase;
    private readonly getUserChatsUseCase: GetUserChatsUseCase;
    private readonly notificationRepository: NotificationRepository;


    constructor() {
        this.chatRepository = new ChatRepository();
        this.messageRepository = new MessageRepository();
        this.notificationRepository = new NotificationRepository();
        this.getChatUseCase = new GetChatByProjectUseCase(this.chatRepository);
        this.getChatMessagesUseCase = new GetChatMessagesUseCase(this.chatRepository);
        this.getUserChatsUseCase = new GetUserChatsUseCase(this.chatRepository);
    }

    async getUserChats(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            const chats = await this.getUserChatsUseCase.execute(userId);
            res.status(STATUS_CODES.OK).json(chats);
        } catch (error) {
            next(error);
        }
    }

    async getChatByProject(req: Request, res: Response, next: NextFunction) {
        try {
            const { projectId } = req.params;
            const chat = await this.getChatUseCase.execute(projectId);
            
            if (!chat) {
                return res.status(STATUS_CODES.NOT_FOUND).json({ 
                    error: MESSAGES.CHAT.CHAT_NOT_FOUND 
                });
            }
            
            res.status(STATUS_CODES.OK).json(chat);
        } catch (error) {
            next(error);
        }
    }

    async getChatMessages(req: Request, res: Response, next: NextFunction) {
        try {
            const { chatId } = req.params;
            const messages = await this.getChatMessagesUseCase.execute(chatId);
            res.status(STATUS_CODES.OK).json(messages);
        } catch (error) {
            next(error);
        }
    }

    async sendMessage(req: Request, res: Response, next: NextFunction) {
        try {
            const { chatId } = req.params;
            const { content } = req.body;
            const senderId = req.user?.id;
    
            if (!senderId) {
                return res.status(STATUS_CODES.UNAUTHORIZED).json({ 
                    message: MESSAGES.AUTH.INVALID_TOKEN 
                });
            }
    
            const messageContent = content?.trim() || null;
            const file = req.file as Express.MulterS3.File | undefined;
            const fileUrl = file?.key || null;
    
            const io = req.app.get('io');
            const socketService = SocketService.getInstance(io);
    
            // Create SendNotificationUseCase instance first
            const sendNotificationUseCase = new SendNotificationUseCase(
                this.notificationRepository,
                socketService
            );
    
            // Now pass it
            const sendMessageUseCase = new SendMessageUseCase(
                this.messageRepository, 
                socketService,
                sendNotificationUseCase,
                this.chatRepository
            );
    
            const message = await sendMessageUseCase.execute(
                chatId, 
                senderId, 
                messageContent, 
                fileUrl
            );
    
            if (!message) {
                return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ 
                    error: MESSAGES.CHAT.MESSAGE_FAILED 
                });
            }
    
            res.status(STATUS_CODES.CREATED).json(message);
        } catch (error) {
            next(error);
        }
    }
    
}