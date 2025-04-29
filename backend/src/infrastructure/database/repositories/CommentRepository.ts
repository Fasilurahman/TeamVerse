import { CommentModel } from "../models/CommentModel";
import { Comment } from "../../../domain/entities/Comment";
import mongoose from "mongoose";

export class CommentRepository {
    async create(taskId: string, authorId: string, content: string): Promise<Comment>{
        const newComment = new CommentModel({taskId: new mongoose.Types.ObjectId(taskId), authorId: new mongoose.Types.ObjectId(authorId), content});
        await newComment.save();
        return new Comment(
            newComment._id,
            newComment.taskId,
            newComment.authorId,
            newComment.content,
            newComment.createdAt
        )
    }

    async getComments(taskId: string): Promise<Comment[]>{
        return await CommentModel.find({ taskId: new mongoose.Types.ObjectId(taskId)})
            .populate('authorId', 'name profilePic')
            .lean()
            .exec();
    }
}