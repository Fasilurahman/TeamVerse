import { ChatRepository } from "../../../infrastructure/database/repositories/ChatRepository";
import mongoose from "mongoose";
import { MESSAGES } from "../../../shared/constants/ResponseMessages";

export class GetChatMessagesUseCase {
    private chatRepository: ChatRepository;

    constructor(chatRepository: ChatRepository) {
        this.chatRepository = chatRepository;
    }

    async execute(chatId: string){
        if(!mongoose.Types.ObjectId.isValid(chatId)){
            throw new Error(MESSAGES.CHAT.INVALID_CHAT_ID);
        }
        return this.chatRepository.getMessagesByChatId(chatId);
    }
}