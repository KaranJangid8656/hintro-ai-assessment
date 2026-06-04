import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { createRequestLogger } from '../lib/logger';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function traceIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.header('X-Trace-Id');
  const traceId = header && UUID_REGEX.test(header) ? header : randomUUID();

  req.traceId = traceId;
  res.setHeader('X-Trace-Id', traceId);
  req.log = createRequestLogger(traceId);
  next();
}
