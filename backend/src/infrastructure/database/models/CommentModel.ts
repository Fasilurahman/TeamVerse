import mongoose from 'mongoose'

const CommentSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true},
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    content: { type: String, required: true},
    createdAt: { type: Date, default: Date.now},
},{timestamps: true})

export const CommentModel = mongoose.model('Comment', CommentSchema)