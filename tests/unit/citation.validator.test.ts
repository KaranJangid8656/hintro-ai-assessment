import {
  buildTranscriptIndex,
  validateMeetingAnalysis,
} from '../../src/services/citation.validator';
import type { MeetingAnalysisResult } from '../../src/types/domain';

const transcript = [
  { timestamp: '00:10', speaker: 'John', text: 'Launch next Friday.' },
  { timestamp: '00:20', speaker: 'Alice', text: 'I will prepare release notes.' },
];

describe('citation validator', () => {
  it('accepts valid citations', () => {
    const analysis: MeetingAnalysisResult = {
      summary: [{ text: 'Launch planned', citations: [{ timestamp: '00:10' }] }],
      actionItems: [
        {
          task: 'Prepare release notes',
          assignee: 'Alice',
          citations: [{ timestamp: '00:20' }],
        },
      ],
      decisions: [],
      followUpSuggestions: [],
    };

    const result = validateMeetingAnalysis(analysis, transcript);
    expect(result.valid).toBe(true);
  });

  it('rejects invalid citation timestamps', () => {
    const analysis: MeetingAnalysisResult = {
      summary: [{ text: 'Fake', citations: [{ timestamp: '99:99' }] }],
      actionItems: [],
      decisions: [],
      followUpSuggestions: [],
    };

    const result = validateMeetingAnalysis(analysis, transcript);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects assignee mismatch at citation', () => {
    const analysis: MeetingAnalysisResult = {
      summary: [],
      actionItems: [
        {
          task: 'Wrong assignee',
          assignee: 'Bob',
          citations: [{ timestamp: '00:20' }],
        },
      ],
      decisions: [],
      followUpSuggestions: [],
    };

    const result = validateMeetingAnalysis(analysis, transcript);
    expect(result.valid).toBe(false);
  });

  it('builds transcript index with normalized keys', () => {
    const { validTimestamps } = buildTranscriptIndex([
      { timestamp: '0:10', speaker: 'John', text: 'Hi' },
    ]);
    expect(validTimestamps.has('00:10')).toBe(true);
  });
});
