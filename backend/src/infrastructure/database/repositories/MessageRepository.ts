import { IMessageRepository } from "../../../domain/repositories/IMessageRepository";
import { MessageModel } from "../models/MessageModal";
import { ChatModel } from "../models/ChatModel";
import mongoose from "mongoose";
import { ChatRepository } from "./ChatRepository";

export class MessageRepository implements IMessageRepository {
    private chatRepository: ChatRepository;

    constructor() {
        this.chatRepository = new ChatRepository();
    }

    async createMessage(chatId: string, sender: string, content?: string, fileUrl?: string) {
        if (!mongoose.Types.ObjectId.isValid(chatId) || !mongoose.Types.ObjectId.isValid(sender)) {
            return null;
        }

        const message = new MessageModel({ 
            chatId, 
            sender, 
            content : content || '',
            fileUrl: fileUrl || ''
        });
        
        const savedMessage = await message.save();
        await this.chatRepository.addMessageToChat(chatId, savedMessage.id.toString());
        
        return await MessageModel.findById(savedMessage._id).populate('sender', 'name email profilePic');
    }

    async getMessagesByChatId(chatId: string){
        if( !mongoose.Types.ObjectId.isValid(chatId) ){
            return null;
        }
        return await MessageModel.find({chatId})
            .populate('sender', 'name email profilePic')
            .sort({createdAt: 1});
    }

    async getChatMemberIds(chatId: string): Promise<string[]> {
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
          return [];
        }

        const chat = await ChatModel.findById(chatId, "members").lean();
        if (!chat || !Array.isArray(chat.members)) {
          return [];
        }

        return chat.members.map((m: mongoose.Types.ObjectId | string) =>
          m.toString()
        );
      }
}