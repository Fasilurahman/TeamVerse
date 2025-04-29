import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authMiddleware } from "../../middleware/authMiddleware";
import { profileUpload } from "../../infrastructure/fileStorage/multerConfig";
const router = Router();
const userController = new UserController();

router.get("/users", authMiddleware, userController.getAllUsers.bind(userController));
router.post("/users/update",profileUpload(), authMiddleware, userController.updateUser.bind(userController));
router.post("/users/:id/block", authMiddleware, userController.blockUser.bind(userController));
router.post("/users/me", authMiddleware, userController.getUserProfile.bind(userController));
router.get("/users/:id", authMiddleware, userController.getUserById.bind(userController));
router.get('/users/search', userController.searchUsers.bind(userController));
router.get("/users/fetch-details/:id", authMiddleware, userController.fetchDetails.bind(userController));
export default router;