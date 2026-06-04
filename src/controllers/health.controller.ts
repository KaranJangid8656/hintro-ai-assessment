import type { Request, Response } from 'express';
import { env } from '../config/env';

export function healthCheck(_req: Request, res: Response) {
  res.status(200).json({ status: 'UP' });
}

export function evaluationInfo(_req: Request, res: Response) {
  res.status(200).json({
    candidateName: env.CANDIDATE_NAME,
    email: env.CANDIDATE_EMAIL,
    repositoryUrl: env.REPOSITORY_URL,
    deployedUrl: env.DEPLOYED_URL,
    externalIntegration: 'Resend Email API',
    features: [
      'Authentication',
      'Meeting Management',
      'AI Analysis',
      'Citation Grounding',
      'Action Item Management',
      'Overdue Detection',
      'Reminder Scheduler',
    ],
  });
}
