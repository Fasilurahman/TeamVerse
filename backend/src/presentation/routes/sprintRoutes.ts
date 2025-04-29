import { Router } from "express";
import { SprintController } from "../controllers/SprintController";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();
const sprintController = new SprintController();

router.post('/create', authMiddleware, sprintController.create.bind(sprintController));
router.get('/', authMiddleware, sprintController.getAllSprints.bind(sprintController));

export default router;