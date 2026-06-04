import { createApp } from './app';
import { env } from './config/env';
import { startReminderCron } from './jobs/reminder.cron';
import { baseLogger } from './lib/logger';
import { db } from './lib/mongodb';

const app = createApp();

if (env.NODE_ENV !== 'test') {
  startReminderCron();
}

db.then(() => {
  app.listen(env.PORT, () => {
    baseLogger.info(
      { port: env.PORT, docs: `/api-docs`, env: env.NODE_ENV },
      'Meeting Intelligence Service started'
    );
  });
}).catch((error: unknown) => {
  baseLogger.error({ error }, 'Failed to connect to MongoDB');
  process.exit(1);
});

export { app };
