import OpenAI from 'openai';
import { env } from '../config/env';
import { ExternalServiceError } from '../lib/errors';
import {
  meetingAnalysisOutputSchema,
  type MeetingAnalysisOutput,
} from '../validators/analysis.validator';
import type { TranscriptInput } from '../types/domain';

const SYSTEM_PROMPT = `You are a meeting intelligence analyst. Your job is to extract insights STRICTLY from the provided transcript.

Rules:
1. Use ONLY information explicitly stated in the transcript.
2. Do NOT invent attendees, action items, decisions, outcomes, or dates.
3. Every summary item, decision, action item, and follow-up suggestion MUST include at least one citation with a "timestamp" copied EXACTLY from the transcript (after normalization they appear as MM:SS).
4. If there is insufficient evidence for an insight, omit it rather than guessing.
5. For action items, assignee must match the speaker at the cited timestamp when an assignee is provided.
6. Return valid JSON only, matching the required schema.`;

function buildUserPrompt(transcript: TranscriptInput[], validationErrors?: string[]) {
  let prompt = `Analyze this meeting transcript and return JSON with keys: summary, actionItems, decisions, followUpSuggestions.

Each summary/decision/followUp item: { "text": string, "citations": [{ "timestamp": string }] }
Each action item: { "task": string, "assignee"?: string, "citations": [{ "timestamp": string }] }

Transcript:
${JSON.stringify(transcript, null, 2)}`;

  if (validationErrors?.length) {
    prompt += `\n\nPrevious output failed validation. Fix these issues:\n${validationErrors.join('\n')}`;
  }

  return prompt;
}

export class OpenAiClient {
  private client: OpenAI | null = null;

  private getClient(): OpenAI {
    if (!env.OPENAI_API_KEY) {
      throw new ExternalServiceError('OpenAI API key is not configured');
    }
    if (!this.client) {
      this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    }
    return this.client;
  }

  async analyzeTranscript(
    transcript: TranscriptInput[],
    validationErrors?: string[]
  ): Promise<MeetingAnalysisOutput> {
    const client = this.getClient();

    const response = await client.chat.completions.create({
      model: env.OPENAI_MODEL,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(transcript, validationErrors) },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new ExternalServiceError('Empty response from OpenAI');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new ExternalServiceError('Invalid JSON from OpenAI');
    }

    const result = meetingAnalysisOutputSchema.safeParse(parsed);
    if (!result.success) {
      throw new ExternalServiceError('OpenAI response failed schema validation', result.error.issues);
    }

    return result.data;
  }
}

export const openAiClient = new OpenAiClient();

/** Test helper: inject mock analysis without calling OpenAI */
export function parseAnalysisFromJson(json: string): MeetingAnalysisOutput {
  const parsed = JSON.parse(json);
  return meetingAnalysisOutputSchema.parse(parsed);
}
