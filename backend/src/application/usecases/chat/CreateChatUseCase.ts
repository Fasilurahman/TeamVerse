import { ChatRepository } from "../../../infrastructure/database/repositories/ChatRepository";

export class CreateChatUseCase {
    constructor(private chatRepository: ChatRepository){}

    async execute(projectId: string, name: string, members: string[]){
        return this.chatRepository.createChat(projectId,name,members);
    }
}