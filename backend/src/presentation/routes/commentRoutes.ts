import express from 'express'
import { CommentController } from "../controllers/CommentController";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = express.Router()
const commentController = new CommentController()

router.post('/', authMiddleware,commentController.addComment.bind(commentController))
router.get('/:taskId',authMiddleware, commentController.getComments.bind(commentController))

export default router