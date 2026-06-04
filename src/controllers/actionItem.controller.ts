import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../lib/apiResponse';
import { actionItemService } from '../services/actionItem.service';

export async function createActionItem(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await actionItemService.create(req.user!.id, req.body);
    sendSuccess(res, req.traceId, item, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateActionItemStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await actionItemService.updateStatus(
      req.user!.id,
      req.params.id,
      req.body.status
    );
    sendSuccess(res, req.traceId, item);
  } catch (err) {
    next(err);
  }
}

export async function listActionItems(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await actionItemService.list(req.user!.id, req.query as never);
    sendSuccess(res, req.traceId, result);
  } catch (err) {
    next(err);
  }
}

export async function getOverdueActionItems(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await actionItemService.getOverdue(req.user!.id);
    sendSuccess(res, req.traceId, { items });
  } catch (err) {
    next(err);
  }
}
