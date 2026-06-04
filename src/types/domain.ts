export interface Citation {
  timestamp: string;
}

export interface InsightBlock {
  text: string;
  citations: Citation[];
}

export interface ActionItemInsight {
  task: string;
  assignee?: string;
  citations: Citation[];
}

export interface MeetingAnalysisResult {
  summary: InsightBlock[];
  actionItems: ActionItemInsight[];
  decisions: InsightBlock[];
  followUpSuggestions: InsightBlock[];
}

export interface TranscriptInput {
  timestamp: string;
  speaker: string;
  text: string;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}
