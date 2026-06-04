import { z } from 'zod';
import { ActionItemStatus } from '../models/ActionItem';

const citationSchema = z.object({
  timestamp: z.string().min(1, 'Citation timestamp is required'),
});

const mongoIdSchema = (msg = 'Invalid ID') => z.string().regex(/^[0-9a-fA-F]{24}$/, msg);

export const createActionItemSchema = z.object({
  task: z.string().min(1, 'Task is required'),
  assignee: z.string().optional(),
  meetingId: mongoIdSchema('Invalid meeting id').optional(),
  dueDate: z.string().datetime().optional(),
  citations: z.array(citationSchema).min(1, 'At least one citation is required'),
});

export const updateActionItemStatusSchema = z.object({
  status: z.nativeEnum(ActionItemStatus, {
    errorMap: () => ({ message: 'Status must be PENDING, IN_PROGRESS, or COMPLETED' }),
  }),
});

export const listActionItemsQuerySchema = z.object({
  status: z.nativeEnum(ActionItemStatus).optional(),
  assignee: z.string().optional(),
  meetingId: mongoIdSchema('Invalid meeting id').optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const actionItemIdParamSchema = z.object({
  id: mongoIdSchema('Invalid action item id'),
});

