import mongoose from 'mongoose';
import { ActionItem, ActionItemStatus, TranscriptSegment, Meeting, User, ReminderLog } from '../models';
import { NotFoundError, ValidationError } from '../lib/errors';
import { normalizeTimestamp } from '../utils/timestamp';
import type { ActionItemInsight, Citation } from '../types/domain';
import { meetingService } from './meeting.service';

export class ActionItemService {
  async create(
    userId: string,
    data: {
      task: string;
      assignee?: string;
      meetingId?: string;
      dueDate?: string;
      citations: Citation[];
    }
  ) {
    if (data.meetingId) {
      await meetingService.getById(userId, data.meetingId);
      await this.validateCitationsAgainstMeeting(data.meetingId, data.citations);
    }

    const actionItem = await ActionItem.create({
      userId: new mongoose.Types.ObjectId(userId),
      meetingId: data.meetingId ? new mongoose.Types.ObjectId(data.meetingId) : undefined,
      task: data.task,
      assignee: data.assignee,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      citations: data.citations.map((c) => ({
        timestamp: normalizeTimestamp(c.timestamp),
      })),
    });

    return {
      ...actionItem.toObject(),
      id: actionItem._id.toString(),
    };
  }

  async createFromAnalysis(userId: string, meetingId: string, items: ActionItemInsight[]) {
    for (const item of items) {
      await ActionItem.create({
        userId: new mongoose.Types.ObjectId(userId),
        meetingId: new mongoose.Types.ObjectId(meetingId),
        task: item.task,
        assignee: item.assignee,
        citations: item.citations,
        status: ActionItemStatus.PENDING,
      });
    }
  }

  async updateStatus(userId: string, actionItemId: string, status: ActionItemStatus) {
    const existing = await ActionItem.findOne({
      _id: new mongoose.Types.ObjectId(actionItemId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!existing) {
      throw new NotFoundError('Action item not found');
    }

    const updated = await ActionItem.findByIdAndUpdate(
      new mongoose.Types.ObjectId(actionItemId),
      { status },
      { returnDocument: 'after' }
    );

    return {
      ...updated!.toObject(),
      id: updated!._id.toString(),
    };
  }

  async list(
    userId: string,
    filters: {
      status?: ActionItemStatus;
      assignee?: string;
      meetingId?: string;
      page: number;
      limit: number;
    }
  ) {
    const query: any = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.assignee) {
      query.assignee = { $regex: filters.assignee, $options: 'i' };
    }

    if (filters.meetingId) {
      query.meetingId = new mongoose.Types.ObjectId(filters.meetingId);
    }

    const skip = (filters.page - 1) * filters.limit;
    const items = await ActionItem.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(filters.limit);

    const total = await ActionItem.countDocuments(query);

    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const meeting = item.meetingId
          ? await Meeting.findById(item.meetingId).select({ id: 1, title: 1 })
          : null;

        return {
          ...item.toObject(),
          id: item._id.toString(),
          meeting: meeting
            ? { id: meeting._id.toString(), title: meeting.title }
            : null,
        };
      })
    );

    return { items: enrichedItems, page: filters.page, limit: filters.limit, total };
  }

  async getOverdue(userId?: string) {
    const now = new Date();
    const query: any = {
      status: { $ne: ActionItemStatus.COMPLETED },
      dueDate: { $ne: null, $lt: now },
    };

    if (userId) {
      query.userId = new mongoose.Types.ObjectId(userId);
    }

    const items = await ActionItem.find(query).sort({ dueDate: 1 });

    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const meeting = item.meetingId
          ? await Meeting.findById(item.meetingId).select({ id: 1, title: 1 })
          : null;
        const user = await User.findById(item.userId).select({ id: 1, email: 1 });
        const reminders = await ReminderLog.find({ actionItemId: item._id })
          .sort({ sentAt: -1 })
          .limit(1);

        return {
          ...item.toObject(),
          id: item._id.toString(),
          meeting: meeting
            ? { id: meeting._id.toString(), title: meeting.title }
            : null,
          user: user ? { id: user._id.toString(), email: user.email } : null,
          reminders: reminders.map((r) => ({
            ...r.toObject(),
            id: r._id.toString(),
          })),
        };
      })
    );

    return enrichedItems;
  }

  private async validateCitationsAgainstMeeting(meetingId: string, citations: Citation[]) {
    const segments = await TranscriptSegment.find({
      meetingId: new mongoose.Types.ObjectId(meetingId),
    });
    const valid = new Set(segments.map((s) => s.timestamp));

    for (const c of citations) {
      const ts = normalizeTimestamp(c.timestamp);
      if (!valid.has(ts)) {
        throw new ValidationError(
          `Citation timestamp "${c.timestamp}" not found in meeting transcript`
        );
      }
    }
  }
}

export const actionItemService = new ActionItemService();
