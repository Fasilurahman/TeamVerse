import express from 'express';
import { ChartDataController } from '../controllers//ChartDataController';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = express.Router();
const chartDataController = new ChartDataController();

router.get('/chart-data', authMiddleware, chartDataController.getChartData.bind(chartDataController));
router.get('/stats', authMiddleware, chartDataController.getStatsData.bind(chartDataController));
router.get('/stats-user', authMiddleware, chartDataController.getStatsUserData.bind(chartDataController));
router.get('/chart-data/:id', authMiddleware, chartDataController.getUserChartData.bind(chartDataController));

export default router;