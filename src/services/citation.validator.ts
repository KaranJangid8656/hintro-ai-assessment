import type {
  ActionItemInsight,
  InsightBlock,
  MeetingAnalysisResult,
  TranscriptInput,
} from '../types/domain';
import { normalizeTimestamp } from '../utils/timestamp';

export interface CitationValidationResult {
  valid: boolean;
  errors: string[];
}

function validateCitationsForBlocks(
  blocks: InsightBlock[],
  label: string,
  validTimestamps: Set<string>,
  segmentByTimestamp: Map<string, TranscriptInput>
): string[] {
  const errors: string[] = [];

  blocks.forEach((block, index) => {
    if (!block.citations?.length) {
      errors.push(`${label}[${index}]: must include at least one citation`);
      return;
    }

    for (const citation of block.citations) {
      const ts = normalizeTimestamp(citation.timestamp);
      if (!validTimestamps.has(ts)) {
        errors.push(
          `${label}[${index}]: citation timestamp "${citation.timestamp}" not found in transcript`
        );
      }
    }
  });

  return errors;
}

function validateActionItemCitations(
  items: ActionItemInsight[],
  validTimestamps: Set<string>,
  segmentByTimestamp: Map<string, TranscriptInput>
): string[] {
  const errors: string[] = [];

  items.forEach((item, index) => {
    if (!item.citations?.length) {
      errors.push(`actionItems[${index}]: must include at least one citation`);
      return;
    }

    for (const citation of item.citations) {
      const ts = normalizeTimestamp(citation.timestamp);
      if (!validTimestamps.has(ts)) {
        errors.push(
          `actionItems[${index}]: citation timestamp "${citation.timestamp}" not found in transcript`
        );
        continue;
      }

      if (item.assignee) {
        const segment = segmentByTimestamp.get(ts);
        if (
          segment &&
          !segment.speaker.toLowerCase().includes(item.assignee.toLowerCase()) &&
          !item.assignee.toLowerCase().includes(segment.speaker.toLowerCase())
        ) {
          errors.push(
            `actionItems[${index}]: assignee "${item.assignee}" does not match speaker at ${ts}`
          );
        }
      }
    }
  });

  return errors;
}

export function buildTranscriptIndex(transcript: TranscriptInput[]) {
  const validTimestamps = new Set<string>();
  const segmentByTimestamp = new Map<string, TranscriptInput>();

  for (const seg of transcript) {
    const ts = normalizeTimestamp(seg.timestamp);
    validTimestamps.add(ts);
    segmentByTimestamp.set(ts, { ...seg, timestamp: ts });
  }

  return { validTimestamps, segmentByTimestamp };
}

export function validateMeetingAnalysis(
  analysis: MeetingAnalysisResult,
  transcript: TranscriptInput[]
): CitationValidationResult {
  const { validTimestamps, segmentByTimestamp } = buildTranscriptIndex(transcript);
  const errors: string[] = [
    ...validateCitationsForBlocks(analysis.summary, 'summary', validTimestamps, segmentByTimestamp),
    ...validateCitationsForBlocks(
      analysis.decisions,
      'decisions',
      validTimestamps,
      segmentByTimestamp
    ),
    ...validateCitationsForBlocks(
      analysis.followUpSuggestions,
      'followUpSuggestions',
      validTimestamps,
      segmentByTimestamp
    ),
    ...validateActionItemCitations(analysis.actionItems, validTimestamps, segmentByTimestamp),
  ];

  return { valid: errors.length === 0, errors };
}

export function normalizeAnalysisCitations(
  analysis: MeetingAnalysisResult
): MeetingAnalysisResult {
  const normalizeBlock = (blocks: InsightBlock[]) =>
    blocks.map((b) => ({
      ...b,
      citations: b.citations.map((c) => ({
        timestamp: normalizeTimestamp(c.timestamp),
      })),
    }));

  return {
    summary: normalizeBlock(analysis.summary),
    decisions: normalizeBlock(analysis.decisions),
    followUpSuggestions: normalizeBlock(analysis.followUpSuggestions),
    actionItems: analysis.actionItems.map((item) => ({
      ...item,
      citations: item.citations.map((c) => ({
        timestamp: normalizeTimestamp(c.timestamp),
      })),
    })),
  };
}
