import mongoose from 'mongoose';
import { env } from '../config/env';
import { ReminderLog } from '../models';
import { resendClient } from '../integrations/resend.client';
import { actionItemService } from './actionItem.service';
import { baseLogger } from '../lib/logger';

export class ReminderService {
  async processOverdueReminders(traceId = 'cron-job') {
    if (!env.RESEND_API_KEY || !env.REMINDER_TO_EMAIL) {
      baseLogger.warn('Skipping reminders: RESEND_API_KEY or REMINDER_TO_EMAIL not set');
      return { processed: 0, sent: 0, skipped: 0, failed: 0 };
    }

    const overdueItems = await actionItemService.getOverdue();
    const cooldownMs = env.REMINDER_COOLDOWN_HOURS * 60 * 60 * 1000;
    const cooldownSince = new Date(Date.now() - cooldownMs);

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const item of overdueItems) {
      const recentReminder = await ReminderLog.findOne({
        actionItemId: new mongoose.Types.ObjectId(item.id),
        success: true,
        sentAt: { $gte: cooldownSince },
      });

      if (recentReminder) {
        skipped++;
        continue;
      }

      const recipient = env.REMINDER_TO_EMAIL!;

      try {
        await resendClient.sendReminderEmail(
          recipient,
          {
            task: item.task,
            assignee: item.assignee,
            dueDate: item.dueDate,
            meetingTitle: item.meeting?.title,
          },
          traceId
        );

        await ReminderLog.create({
          actionItemId: new mongoose.Types.ObjectId(item.id),
          channel: 'resend',
          recipient,
          success: true,
          traceId,
        });
        sent++;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        await ReminderLog.create({
          actionItemId: new mongoose.Types.ObjectId(item.id),
          channel: 'resend',
          recipient,
          success: false,
          errorMessage: message,
          traceId,
        });
        failed++;
        baseLogger.error({ err, actionItemId: item.id, traceId }, 'Failed to send reminder');
      }
    }

    return { processed: overdueItems.length, sent, skipped, failed };
  }
}

export const reminderService = new ReminderService();
