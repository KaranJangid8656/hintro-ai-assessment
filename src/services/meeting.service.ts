import mongoose from 'mongoose';
import { Meeting, TranscriptSegment, MeetingAnalysis, ActionItem } from '../models';
import { NotFoundError } from '../lib/errors';
import { normalizeTimestamp } from '../utils/timestamp';
import type { TranscriptInput } from '../types/domain';

export class MeetingService {
  async create(
    userId: string,
    data: {
      title: string;
      participants: string[];
      meetingDate: string;
      transcript: TranscriptInput[];
    }
  ) {
    const meeting = await Meeting.create({
      userId: new mongoose.Types.ObjectId(userId),
      title: data.title,
      participants: data.participants,
      meetingDate: new Date(data.meetingDate),
    });

    const transcriptSegments = await TranscriptSegment.insertMany(
      data.transcript.map((seg, order) => ({
        meetingId: meeting._id,
        timestamp: normalizeTimestamp(seg.timestamp),
        speaker: seg.speaker,
        text: seg.text,
        order,
      }))
    );

    return {
      ...meeting.toObject(),
      id: meeting._id.toString(),
      transcript: transcriptSegments
        .sort((a, b) => a.order - b.order)
        .map((seg) => ({
          ...seg.toObject(),
          id: seg._id.toString(),
        })),
    };
  }

  async getById(userId: string, meetingId: string) {
    const meeting = await Meeting.findOne({
      _id: new mongoose.Types.ObjectId(meetingId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!meeting) {
      throw new NotFoundError('Meeting not found');
    }

    const transcript = await TranscriptSegment.find({ meetingId: meeting._id }).sort({ order: 1 });
    const analyses = await MeetingAnalysis.find({ meetingId: meeting._id })
      .sort({ createdAt: -1 })
      .limit(1);

    return {
      ...meeting.toObject(),
      id: meeting._id.toString(),
      transcript: transcript.map((seg) => ({
        ...seg.toObject(),
        id: seg._id.toString(),
      })),
      analyses: analyses.map((analysis) => ({
        ...analysis.toObject(),
        id: analysis._id.toString(),
      })),
    };
  }

  async list(userId: string, page: number, limit: number, title?: string) {
    const query: any = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const items = await Meeting.find(query)
      .sort({ meetingDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Meeting.countDocuments(query);

    const enrichedItems = await Promise.all(
      items.map(async (meeting) => {
        const transcript = await TranscriptSegment.find({ meetingId: meeting._id }).sort({ order: 1 });
        const actionItemsCount = await ActionItem.countDocuments({ meetingId: meeting._id });
        const analysesCount = await MeetingAnalysis.countDocuments({ meetingId: meeting._id });

        return {
          ...meeting.toObject(),
          id: meeting._id.toString(),
          transcript: transcript.map((seg) => ({
            ...seg.toObject(),
            id: seg._id.toString(),
          })),
          _count: {
            actionItems: actionItemsCount,
            analyses: analysesCount,
          },
        };
      })
    );

    return { items: enrichedItems, page, limit, total };
  }

  async getTranscriptForAnalysis(userId: string, meetingId: string) {
    const meeting = await Meeting.findOne({
      _id: new mongoose.Types.ObjectId(meetingId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!meeting) {
      throw new NotFoundError('Meeting not found');
    }

    const transcript = await TranscriptSegment.find({ meetingId: meeting._id }).sort({ order: 1 });

    if (transcript.length === 0) {
      throw new NotFoundError('Meeting has no transcript to analyze');
    }

    return {
      ...meeting.toObject(),
      id: meeting._id.toString(),
      transcript: transcript.map((seg) => ({
        ...seg.toObject(),
        id: seg._id.toString(),
      })),
    };
  }
}

export const meetingService = new MeetingService();
