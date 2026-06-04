import type { Logger } from 'pino';

declare global {
  namespace Express {
    interface Request {
      traceId: string;
      log: Logger;
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export {};
