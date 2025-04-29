import mongoose, { Schema, Document } from "mongoose";

interface IChat extends Document {
    projectId: mongoose.Types.ObjectId;
    name: string;
    members: mongoose.Types.ObjectId[];
    isGroupChat: boolean;
    messages: mongoose.Types.ObjectId[];
}

const ChatSchema = new Schema<IChat>({
    projectId: {type: Schema.Types.ObjectId, ref: "Project", required: true},
    name: {type: String, required: true},
    members: [{type: Schema.Types.ObjectId, ref:'User', required: true}],
    isGroupChat: { type: Boolean, default: true },
    messages: [{ type: Schema.Types.ObjectId, ref: "Message" }]
}, { timestamps: true });

export const ChatModel = mongoose.model<IChat>("Chat", ChatSchema);