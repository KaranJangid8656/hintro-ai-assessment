import { Router } from 'express';
import authRoutes from './auth.routes';
import meetingsRoutes from './meetings.routes';
import actionItemsRoutes from './actionItems.routes';
import { evaluationInfo, healthCheck } from '../controllers/health.controller';

const router = Router();

router.get('/health', healthCheck);
router.get('/api/evaluation', evaluationInfo);
router.use('/api/auth', authRoutes);
router.use('/api/meetings', meetingsRoutes);
router.use('/api/action-items', actionItemsRoutes);

export default router;
