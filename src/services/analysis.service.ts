import mongoose from 'mongoose';
import { MeetingAnalysis } from '../models';
import { AiAnalysisError } from '../lib/errors';
import { openAiClient } from '../integrations/openai.client';
import { meetingService } from './meeting.service';
import {
  normalizeAnalysisCitations,
  validateMeetingAnalysis,
} from './citation.validator';
import type { MeetingAnalysisResult, TranscriptInput } from '../types/domain';
import { actionItemService } from './actionItem.service';

export interface MeetingAnalysisResponse extends MeetingAnalysisResult {
  analysisId: string;
  analyzedAt: Date;
}

export class AnalysisService {
  async analyzeMeeting(userId: string, meetingId: string): Promise<MeetingAnalysisResponse> {
    const meeting = await meetingService.getTranscriptForAnalysis(userId, meetingId);

    const transcript: TranscriptInput[] = meeting.transcript.map((s) => ({
      timestamp: s.timestamp,
      speaker: s.speaker,
      text: s.text,
    }));

    let analysis = await this.runWithValidation(transcript);

    const record = await MeetingAnalysis.create({
      meetingId: new mongoose.Types.ObjectId(meeting.id),
      summary: analysis.summary,
      decisions: analysis.decisions,
      followUpSuggestions: analysis.followUpSuggestions,
      actionItems: analysis.actionItems,
    });

    await actionItemService.createFromAnalysis(userId, meeting.id, analysis.actionItems);

    return {
      ...analysis,
      analysisId: record._id.toString(),
      analyzedAt: record.createdAt,
    };
  }

  private async runWithValidation(transcript: TranscriptInput[]): Promise<MeetingAnalysisResult> {
    let validationErrors: string[] | undefined;

    for (let attempt = 0; attempt < 2; attempt++) {
      const raw = await openAiClient.analyzeTranscript(transcript, validationErrors);
      const analysis = normalizeAnalysisCitations(raw);
      const validation = validateMeetingAnalysis(analysis, transcript);

      if (validation.valid) {
        return analysis;
      }

      validationErrors = validation.errors;
    }

    throw new AiAnalysisError('AI analysis failed citation validation', {
      errors: validationErrors,
    });
  }
}

export const analysisService = new AnalysisService();
