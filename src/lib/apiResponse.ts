import type { Response } from 'express';
import type { ApiErrorBody } from '../types/domain';

export function sendSuccess<T>(res: Response, traceId: string, data: T, statusCode = 200): void {
  res.status(statusCode).json({
    traceId,
    success: true,
    data,
  });
}

export function sendError(
  res: Response,
  traceId: string,
  error: ApiErrorBody,
  statusCode: number
): void {
  res.status(statusCode).json({
    traceId,
    success: false,
    error,
  });
}
