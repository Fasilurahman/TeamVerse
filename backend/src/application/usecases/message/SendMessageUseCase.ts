import mongoose from "mongoose";
import { MessageRepository } from "../../../infrastructure/database/repositories/MessageRepository";
import { SocketService } from "../../../infrastructure/services/socketService";
import { SendNotificationUseCase } from "../../../application/usecases/Notification/SendNotificationUseCase";
import { ChatRepository } from "../../../infrastructure/database/repositories/ChatRepository";

export class SendMessageUseCase {
    constructor(
        private messageRepository: MessageRepository,
        private socketService: SocketService,
        private sendNotification: SendNotificationUseCase,
        private chatRepository: ChatRepository
    ){}

    async execute(chatId: string, senderId: string, content: string | null, fileUrl: string | null){
        if(! senderId){
            throw new Error('User not authenticated');
        }
        if(! mongoose.Types.ObjectId.isValid(chatId)){
            throw new Error('Invalid chat id');
        }
        if(!content?.trim() && !fileUrl){
            throw new Error('Content or file is required');
        }
        const message = await this.messageRepository.createMessage(chatId,senderId,content ?? undefined,  fileUrl ?? undefined)
        if(message){
            this.socketService.notifyChatMembers(chatId,message);
        }

        const memberIds = await this.messageRepository.getChatMemberIds(chatId);

        const chatName = await this.chatRepository.getChatNameById(chatId) || "New Chat";

        console.log(memberIds,'123456');
        await this.sendNotification.execute(
            memberIds,
            `New message from ${chatName}`,
            "chat"
        );
        return message;
    }
}