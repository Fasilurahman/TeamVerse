import { ChatModel } from "../models/ChatModel";
import { MessageModel } from "../models/MessageModal";
import mongoose from "mongoose";
export class ChatRepository {
    async createChat(projectId: string, name: string, members: string[]){
        const chat = new ChatModel({
            projectId, 
            name, 
            members, 
            isGroupChat: true,
            messages: []
        });
        return await chat.save();
    }

    async getChatByProjectId(projectId: string) {
        return await ChatModel.findOne({ projectId })
            .populate('members', 'name email') 
            .populate({
                path: 'messages',
                populate: {
                    path: 'sender',
                    select: 'name email'
                }
            });
    }

    async findChatsByUser(userId: string) {
      return await ChatModel.aggregate([
          {
              $match: { 
                  members: new mongoose.Types.ObjectId(userId),
                  isGroupChat: true // Only fetch group chats
              }
          },
          {
              $lookup: {
                  from: "projects", // Lookup project details
                  localField: "projectId",
                  foreignField: "_id",
                  as: "projectDetails"
              }
          },
          {
              $unwind: {
                  path: "$projectDetails",
                  preserveNullAndEmptyArrays: true
              }
          },
          {
              $lookup: {
                  from: "users", // Lookup user details
                  localField: "members",
                  foreignField: "_id",
                  as: "userDetails"
              }
          },
          {
              $project: {
                  _id: 1,
                  isGroupChat: 1,
                  name: 1,
                  members: 1,
                  createdAt: 1,
                  updatedAt: 1,
                  "projectDetails._id": 1,
                  "projectDetails.name": 1,
                  "projectDetails.description": 1,
                  "projectDetails.startDate": 1,
                  "projectDetails.endDate": 1,
                  "projectDetails.status": 1,
                  "projectDetails.priority": 1,
                  "projectDetails.category": 1,
                  "projectDetails.teamId": 1,
                  "projectDetails.teamLeadId": 1,
                  "projectDetails.image": 1,
                  userDetails: {
                      _id: 1,
                      name: 1,
                      email: 1,
                      role: 1,
                      profilePic: 1,
                      location: 1,
                      phone: 1,
                      status: 1
                  }
              }
          }
      ]);
  }

   async getChatMessageById(chatId: string){
    return 
   }
  
  

    async getChatById(chatId: string) {
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return null;
        }
        return await ChatModel.findById(chatId)
            .populate('members', 'name email')
            .populate({
                path: 'messages',
                populate: {
                    path: 'sender',
                    select: 'name email'
                }
            });
    }

    async addMessageToChat(chatId: string, messageId: string): Promise<void> {
        await ChatModel.findByIdAndUpdate(
            chatId,
            { $push: { messages: messageId } }
        );
    }

    async getMessagesByChatId(chatId: string) {
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            throw new Error("Invalid chat ID");
        }

        // Find the chat and get message IDs
        const chat = await ChatModel.findById(chatId).select("messages");
        if (!chat) {
            throw new Error("Chat not found");
        }

        const messages = await MessageModel.find({ _id: { $in: chat.messages } })
            .populate("sender", "name email profilePic") // Populate sender details
            .sort({ createdAt: 1 }); // Sort messages by oldest first

        return messages;
    }

    async getChatNameById(chatId: string) {
        const chat = await ChatModel.findById(chatId).select("name").lean()
        return chat?.name ?? null;

    }
}