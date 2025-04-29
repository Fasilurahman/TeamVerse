import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import { projectUpload } from "../../infrastructure/fileStorage/multerConfig";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();
const projectController = new ProjectController();

router.use((req, res, next) => {
  console.log(`Request received at ${req.originalUrl}`);
  next();
});

// Add file upload handling before calling the controller
router.post("/create", authMiddleware, projectUpload(), projectController.create.bind(projectController));
router.get("/projects",authMiddleware, projectController.getAllProjects.bind(projectController));
router.put(
  "/update/:id",
  authMiddleware,
  projectUpload(),
  projectController.update.bind(projectController)
);
router.get('/projects/team-lead', projectController.getProjectsByTeamLead.bind(projectController));
router.get("/employees",authMiddleware, projectController.getAllEmployees.bind(projectController));
router.get("/:id", authMiddleware,projectController.getProjectById.bind(projectController));
router.delete('/:id',authMiddleware, projectController.delete.bind(projectController))
export default router;
