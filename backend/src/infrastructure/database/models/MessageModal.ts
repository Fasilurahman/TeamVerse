import mongoose, { Schema, Document } from "mongoose";

interface IMessage extends Document {
    chatId: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    content: string;
    fileUrl: string | null;
}

const MessageSchema = new Schema<IMessage>({
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, default: '' },
    fileUrl: { type: String, default: null },
}, { timestamps: true });

export const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);