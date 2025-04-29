import express from "express";
import { TeamController } from "../controllers/TeamController";
import { authMiddleware } from "../../middleware/authMiddleware";
const router = express.Router();

const teamController = new TeamController();

router.post("/create", authMiddleware, teamController.createTeam.bind(teamController));
router.get("/:id", teamController.getTeamById.bind(teamController));
router.get('/members/team', authMiddleware, teamController.fetchTeamMembers.bind(teamController));

export default router;
