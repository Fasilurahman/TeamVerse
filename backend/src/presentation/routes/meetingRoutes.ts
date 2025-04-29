import express from 'express';
import { MeetingController } from '../controllers/MeetingController';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = express.Router();
const meetingController = new MeetingController();


router.post('/create',authMiddleware, meetingController.create.bind(meetingController));
router.get('/my-meetings',authMiddleware, meetingController.getAll.bind(meetingController))
router.post('/summary',authMiddleware, meetingController.generateMeetingSummary.bind(meetingController))

export default router;
