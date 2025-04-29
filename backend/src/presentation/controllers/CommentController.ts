import { Request, Response, NextFunction } from "express";
import { STATUS_CODES } from "../../shared/constants/statusCodes";
import { AddCommentUseCase } from "../../application/usecases/comment/AddCommentUseCase";
import { GetAllCommentsUseCase } from "../../application/usecases/comment/GetAllCommentsUseCase";
import { CommentRepository } from "../../infrastructure/database/repositories/CommentRepository";
import { SocketService } from "../../infrastructure/services/socketService";
import { MESSAGES } from "../../shared/constants/ResponseMessages";


export class CommentController {
    private readonly commentRepository: CommentRepository;
    private readonly getAllCommentsUseCase: GetAllCommentsUseCase;

    constructor(){
        this.commentRepository = new CommentRepository();
        this.getAllCommentsUseCase = new GetAllCommentsUseCase(this.commentRepository);
    }

    async addComment(req: Request, res: Response, next: NextFunction) {
        try {
            const { taskId, content, authorId } = req.body;
            const io = req.app.get('io');
            const socketService = SocketService.getInstance(io);
            const addCommentUseCase = new AddCommentUseCase(this.commentRepository, socketService);
            const comment = await addCommentUseCase.execute(taskId, content, authorId); 
            socketService.notifyNewComment(comment)
            return res.status(STATUS_CODES.CREATED).json(comment);
        } catch (error) {
            next(error);
        }
    }

    async getComments(req: Request, res: Response, next: NextFunction) {
        try {
            const { taskId } = req.params;
            const comments = await this.getAllCommentsUseCase.execute(taskId);
            return res.status(STATUS_CODES.OK).json(comments);
        } catch (error) {
            next(error);
        }
    }
}