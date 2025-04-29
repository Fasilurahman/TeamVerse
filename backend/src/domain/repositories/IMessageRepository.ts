import { Document } from "mongoose";
import { Message } from "../entities/Message";
import { ChatModel } from "../../infrastructure/database/models/ChatModel";

export interface IMessageRepository {
    createMessage(chatId: string, senderId: string, content: string, fileUrl?: string): Promise<any>;
    getMessagesByChatId(chatId: string): Promise<any>;
    getChatMemberIds(chatId: string): Promise<string[] | null>;
}
