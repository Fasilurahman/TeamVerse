import mongoose, { ObjectId } from "mongoose";

export class Notification {
    public readonly id?: string;
    public readonly userId: mongoose.Types.ObjectId;
    public readonly message: string;
    public readonly type: "project" | "task" | "general" | "chat";
    public readonly read: boolean;
    public readonly createdAt?: Date;

    constructor(
        userId: mongoose.Types.ObjectId,
        message: string,
        type: "project" | "task" | "general" | "chat",
        read: boolean = false,
        createdAt?: Date
    ) {
        this.userId = userId;
        this.message = message;
        this.type = type;
        this.read = read;
        this.createdAt = createdAt || new Date();
    }
}
