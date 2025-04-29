import { Chat } from "../entities/Chat";

export interface IChatRepository {
    createChat(chat: Chat): Promise<Chat>;
    getChatByProjectId(projectId: string): Promise<Chat | null>;
    getChatMessageById(chatId: string): Promise<Chat | null>;

}