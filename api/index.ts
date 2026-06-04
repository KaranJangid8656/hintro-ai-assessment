import { createApp } from '../src/app';
import { db } from '../src/lib/mongodb';

const app = createApp();

// Middleware to ensure database connection is established
app.use(async (req, res, next) => {
  try {
    await db;
    next();
  } catch (err) {
    next(err);
  }
});

export default app;
