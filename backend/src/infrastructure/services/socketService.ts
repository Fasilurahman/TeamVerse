import { Server } from "socket.io";
import { AddCommentUseCase } from "../../application/usecases/comment/AddCommentUseCase";
import { GetAllCommentsUseCase } from "../../application/usecases/comment/GetAllCommentsUseCase";
import { CommentRepository } from "../database/repositories/CommentRepository";

export class SocketService {
    private static instance: SocketService;
    private io: Server;
    private userSockets: Map<string, string[]>;

    constructor(io: Server) {
        this.io = io;
        this.userSockets = new Map();
        
        console.log("SocketService initialized");
    }

    public static getInstance(io: Server): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService(io);
        }
        return SocketService.instance;
    }

    registerUser(userId: string, socketId: string) {
        console.log(`Registering user: ${userId} with socket: ${socketId}`);
        
        if (!userId) return;
        
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, [socketId]);
        } else {
            const sockets = this.userSockets.get(userId) || [];
            if (!sockets.includes(socketId)) {
                sockets.push(socketId);
                this.userSockets.set(userId, sockets);
            }
        }
        
        console.log(`Current user-socket mappings:`, Object.fromEntries(this.userSockets));
    }

    removeSocket(socketId: string) {
        for (const [userId, sockets] of this.userSockets.entries()) {
            const filteredSockets = sockets.filter(id => id !== socketId);
            
            if (filteredSockets.length === 0) {
                this.userSockets.delete(userId);
            } else if (filteredSockets.length !== sockets.length) {
                this.userSockets.set(userId, filteredSockets);
            }
        }
    }


    sendNotification(userId: string, notification: any) {
        
        const socketIds = this.userSockets.get(userId);
        
        if (socketIds && socketIds.length > 0) {
            
            socketIds.forEach(socketId => {
                console.log(`Emitting to socket: ${socketId}`);
                this.io.to(socketId).emit('notification', notification);
            });
        } else {
            console.log(`No active sockets found for user ${userId}`);
        }
    }

    notifyChatMembers(chatId: string, message: any){
        console.log(`Broadcasting message to chat: ${chatId}`, message);
        this.io.to(`chat:${chatId}`).emit('chat-message', message);
    }

    notifyNewComment(comment: any){
        this.io.to(comment.taskId.toString()).emit('new-comment', comment)
    }

    joinChatRoom(socketId: string, chatId: string){
        const socket = this.io.sockets.sockets.get(socketId);
        if(socket){
            socket.join(`chat:${chatId}`);
            console.log(`Socket ${socketId} joined chat ${chatId}`);
        }
    }

    getActiveSocketCount() {
        let total = 0;
        this.userSockets.forEach(sockets => {
            total += sockets.length;
        });
        return total;
    }
}


export const initSocket = (io: Server) => {
    const socketService = SocketService.getInstance(io);

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('register', (userId) => {
            console.log(`User ${userId} registering with socket ${socket.id}`);
            socketService.registerUser(userId, socket.id);
        });

        socket.on('join-chat', (chatId) => {
            socket.join(`chat:${chatId}`);
            console.log(`Socket ${socket.id} joined chat ${chatId}`);
        });

        socket.on("send-message", async ({ chatId, message }) => {
            console.log(`📨 Received message for chat ${chatId}:`, message);
            await socketService.notifyChatMembers(chatId, message);
            
        });

        socket.on('add-comment', async (commentData)=>{
            console.log(`Received comment data:`, commentData);
            try {
                const commentRepository = new CommentRepository();
                const getAllCommentsUseCase = new GetAllCommentsUseCase(commentRepository);
                
                const comments = await getAllCommentsUseCase.execute(commentData.taskId)
                socketService.notifyNewComment(comments[comments.length - 1])
            } catch (error) {
                
            }
        })

        socket.on('leave-chat', (chatId) => {
            socket.leave(`chat:${chatId}`);
            console.log(`Socket ${socket.id} left chat ${chatId}`);
        })

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
            socketService.removeSocket(socket.id);
        });
        
        setInterval(() => {
            console.log(`Active socket connections: ${socketService.getActiveSocketCount()}`);
        }, 60000);
    });
    
    return socketService;
};
