import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import authenticate from '../middleware/authenticate';

const router = Router();

// All logged in users can view the dashboard
router.use(authenticate);

router.get('/summary', dashboardController.getSummary);
router.get('/by-category', dashboardController.getCategoryBreakdown);
router.get('/trends', dashboardController.getTrends);
router.get('/recent', dashboardController.getRecentActivity);

export default router;
