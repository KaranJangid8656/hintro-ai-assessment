import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../lib/apiResponse';
import { authService } from '../services/auth.service';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name } = req.body;
    const result = await authService.register(email, password, name);
    sendSuccess(res, req.traceId, result, 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    sendSuccess(res, req.traceId, result);
  } catch (err) {
    next(err);
  }
}
