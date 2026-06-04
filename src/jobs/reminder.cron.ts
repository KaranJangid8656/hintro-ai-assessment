import cron from 'node-cron';
import { env } from '../config/env';
import { reminderService } from '../services/reminder.service';
import { baseLogger } from '../lib/logger';
import { randomUUID } from 'crypto';

let scheduled = false;

export function startReminderCron() {
  if (scheduled || env.NODE_ENV === 'test') {
    return;
  }

  if (!cron.validate(env.CRON_REMINDER_SCHEDULE)) {
    baseLogger.error(
      { schedule: env.CRON_REMINDER_SCHEDULE },
      'Invalid CRON_REMINDER_SCHEDULE; reminder job not started'
    );
    return;
  }

  cron.schedule(env.CRON_REMINDER_SCHEDULE, async () => {
    const traceId = randomUUID();
    baseLogger.info({ traceId }, 'Running overdue reminder job');
    try {
      const result = await reminderService.processOverdueReminders(traceId);
      baseLogger.info({ traceId, result }, 'Reminder job completed');
    } catch (err) {
      baseLogger.error({ err, traceId }, 'Reminder job failed');
    }
  });

  scheduled = true;
  baseLogger.info({ schedule: env.CRON_REMINDER_SCHEDULE }, 'Reminder cron job scheduled');
}
