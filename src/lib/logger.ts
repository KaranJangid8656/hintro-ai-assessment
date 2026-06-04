import pino from 'pino';
import { env } from '../config/env';

export const baseLogger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
});

export function createRequestLogger(traceId: string) {
  return baseLogger.child({ traceId });
}
