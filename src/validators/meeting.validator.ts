import { z } from 'zod';

const transcriptSegmentSchema = z.object({
  timestamp: z.string().min(1, 'Timestamp is required'),
  speaker: z.string().min(1, 'Speaker is required'),
  text: z.string().min(1, 'Transcript text is required'),
});

export const createMeetingSchema = z.object({
  title: z.string().min(1, 'Meeting title is required'),
  participants: z.array(z.string().email('Invalid participant email')).default([]),
  meetingDate: z.string().datetime({ message: 'meetingDate must be a valid ISO datetime' }),
  transcript: z.array(transcriptSegmentSchema).min(1, 'Transcript must have at least one segment'),
});

export const listMeetingsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  title: z.string().optional(),
});

export const meetingIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid meeting id'),
});
