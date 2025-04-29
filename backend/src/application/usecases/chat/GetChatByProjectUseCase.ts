import { ChatRepository } from "../../../infrastructure/database/repositories/ChatRepository";
import mongoose from "mongoose";
export class GetChatByProjectUseCase {
    private chatRepository: ChatRepository;

    constructor(chatRepository: ChatRepository){
        this.chatRepository = chatRepository;
    }

    async execute(projectId: string){
        if(!mongoose.Types.ObjectId.isValid(projectId)){
            throw new Error("Invalid project id");
        }
        return this.chatRepository.getChatByProjectId(projectId);
    }
}