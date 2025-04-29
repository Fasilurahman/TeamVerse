import { CommentRepository } from "../../../infrastructure/database/repositories/CommentRepository";
import { Comment } from "../../../domain/entities/Comment";

export class GetAllCommentsUseCase {
    private commentRepository: CommentRepository;
     constructor(commentRepository: CommentRepository) {
         this.commentRepository = commentRepository;
     }
     async execute(taskId: string): Promise<Comment[]>{
        return await this.commentRepository.getComments(taskId);
     }
}
