import mongoose from "mongoose";

export class Comment {
    constructor(
        public _id: mongoose.Types.ObjectId,
        public taskId: mongoose.Types.ObjectId,
        public authorId: mongoose.Types.ObjectId,
        public content: string,
        public createdAt: Date
    ) {}
}
