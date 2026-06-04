import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../lib/apiResponse';
import { meetingService } from '../services/meeting.service';
import { analysisService } from '../services/analysis.service';

export async function createMeeting(req: Request, res: Response, next: NextFunction) {
  try {
    const meeting = await meetingService.create(req.user!.id, req.body);
    sendSuccess(res, req.traceId, meeting, 201);
  } catch (err) {
    next(err);
  }
}

export async function getMeeting(req: Request, res: Response, next: NextFunction) {
  try {
    const meeting = await meetingService.getById(req.user!.id, req.params.id);
    sendSuccess(res, req.traceId, meeting);
  } catch (err) {
    next(err);
  }
}

export async function listMeetings(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, title } = req.query as unknown as {
      page: number;
      limit: number;
      title?: string;
    };
    const result = await meetingService.list(req.user!.id, page, limit, title);
    sendSuccess(res, req.traceId, result);
  } catch (err) {
    next(err);
  }
}

export async function analyzeMeeting(req: Request, res: Response, next: NextFunction) {
  try {
    const analysis = await analysisService.analyzeMeeting(req.user!.id, req.params.id);
    sendSuccess(res, req.traceId, analysis);
  } catch (err) {
    next(err);
  }
}
