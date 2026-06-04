import { z } from 'zod';

const citationSchema = z.object({
  timestamp: z.string().min(1),
});

const insightBlockSchema = z.object({
  text: z.string().min(1),
  citations: z.array(citationSchema).min(1),
});

const actionItemInsightSchema = z.object({
  task: z.string().min(1),
  assignee: z.string().optional(),
  citations: z.array(citationSchema).min(1),
});

export const meetingAnalysisOutputSchema = z.object({
  summary: z.array(insightBlockSchema),
  actionItems: z.array(actionItemInsightSchema),
  decisions: z.array(insightBlockSchema),
  followUpSuggestions: z.array(insightBlockSchema),
});

export type MeetingAnalysisOutput = z.infer<typeof meetingAnalysisOutputSchema>;
