# AI Approach

## Overview

Meeting analysis uses OpenAI chat completions with `temperature: 0` and JSON response mode. Output is validated with Zod, then citation-grounded against the stored transcript before persisting.

## Prompt Design

**System prompt** instructs the model to:
- Use ONLY the provided transcript
- Never invent attendees, tasks, decisions, or outcomes
- Include at least one citation per insight
- Copy citation timestamps exactly from the transcript
- Omit items when evidence is insufficient

**User prompt** contains the full transcript as JSON (`timestamp`, `speaker`, `text`) and the required output schema.

On validation failure, a **retry** sends the same transcript plus explicit error messages from the validator.

## Citation Strategy

1. **Ingest:** Timestamps normalized to `MM:SS` on meeting create (`normalizeTimestamp`).
2. **Model output:** Each `summary`, `decision`, `followUpSuggestions`, and `actionItems` entry includes `citations: [{ timestamp }]`.
3. **Post-processing:** Citations normalized to match stored segments.
4. **Validation:**
   - Every block has `citations.length >= 1`
   - Each timestamp exists in the transcript set
   - If `assignee` is set on an action item, speaker at cited timestamp must match assignee (case-insensitive substring)

## Hallucination Prevention

| Layer | Mechanism |
|-------|-----------|
| Prompt | Strict “only transcript” rules |
| Schema | Zod rejects malformed shapes |
| Citations | Server validates timestamps against DB |
| Assignee | Tied to speaker at citation |
| Retry | One retry with validator errors |
| Failure | `AI_ANALYSIS_FAILED` if still invalid |

## Output Validation

`meetingAnalysisOutputSchema` (Zod) enforces structure before citation checks.

Persisted in `MeetingAnalysis` as JSON; extracted action items also create `ActionItem` rows linked to the meeting.

## Known Limitations

- Assignee matching is fuzzy (substring on speaker name); nicknames may fail validation.
- Model may return empty arrays if transcript is very short — valid behavior.
- No semantic embedding search; grounding is timestamp-only.
- Due dates are NOT inferred unless explicitly stated in transcript (action items created without `dueDate` from analysis).
- Requires `OPENAI_API_KEY`; no offline fallback.

## Model Configuration

- Default model: `gpt-4o-mini` (override via `OPENAI_MODEL`)
- `response_format: { type: "json_object" }`
- `temperature: 0`
