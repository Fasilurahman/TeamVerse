import { Comment } from "../../domain/entities/Comment";

export interface ICommentRepository {
    create(taskId: string, authorId: string, content: string): Promise<Comment>;
    getComments(taskId: string): Promise<Comment[]>;
}
