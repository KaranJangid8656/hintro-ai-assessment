import { Router } from 'express';
import { randomUUID } from 'crypto';
import authRoutes from './auth.routes';
import meetingsRoutes from './meetings.routes';
import actionItemsRoutes from './actionItems.routes';
import { evaluationInfo, healthCheck } from '../controllers/health.controller';
import { reminderService } from '../services/reminder.service';
import { sendSuccess } from '../lib/apiResponse';
import { UnauthorizedError } from '../lib/errors';

const router = Router();

router.get('/health', healthCheck);
router.get('/api/evaluation', evaluationInfo);
router.use('/api/auth', authRoutes);
router.use('/api/meetings', meetingsRoutes);
router.use('/api/action-items', actionItemsRoutes);

router.all('/api/jobs/reminders', async (req, res, next) => {
  const traceId = req.traceId || randomUUID();
  try {
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      throw new UnauthorizedError('Unauthorized cron trigger');
    }

    req.log?.info({ traceId }, 'Running serverless overdue reminder job');
    const result = await reminderService.processOverdueReminders(traceId);
    sendSuccess(res, traceId, result);
  } catch (err) {
    next(err);
  }
});

export default router;
