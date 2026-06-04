import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../lib/apiResponse';
import { AppError } from '../lib/errors';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const traceId = req.traceId ?? 'unknown';

  if (err instanceof AppError) {
    req.log?.warn({ err: { code: err.code, message: err.message, details: err.details } });
    sendError(
      res,
      traceId,
      { code: err.code, message: err.message, details: err.details },
      err.statusCode
    );
    return;
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    }));
    req.log?.warn({ err: { code: 'VALIDATION_ERROR', details } });
    sendError(
      res,
      traceId,
      { code: 'VALIDATION_ERROR', message: 'Validation failed', details },
      400
    );
    return;
  }

  req.log?.error({ err });
  sendError(
    res,
    traceId,
    { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
    500
  );
}
