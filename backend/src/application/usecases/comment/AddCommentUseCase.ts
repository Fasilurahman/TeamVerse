import { CommentRepository } from "../../../infrastructure/database/repositories/CommentRepository";
import { Comment } from "../../../domain/entities/Comment";
import { SocketService } from "../../../infrastructure/services/socketService";

export class AddCommentUseCase {
    private commentRepository: CommentRepository;
    private socketService: SocketService;

    constructor(commentRepository: CommentRepository, socketService: SocketService) {
        this.commentRepository = commentRepository;
        this.socketService = socketService;
    }

    async execute(taskId: string, content: string, authorId: string): Promise<Comment>{
        const comment = await this.commentRepository.create(taskId, authorId, content);
        this.socketService.notifyNewComment(comment);
        return comment;
    }
}