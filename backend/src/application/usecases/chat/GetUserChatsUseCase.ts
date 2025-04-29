import { ChatRepository } from "../../../infrastructure/database/repositories/ChatRepository";

export class GetUserChatsUseCase {
    constructor(private chatRepository: ChatRepository){}

    async execute(userId: string){
        if(! userId ){
            throw new Error('User id is required');
        } 
        return this.chatRepository.findChatsByUser(userId);
    }
}