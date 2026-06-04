# Technical Decisions

## Database: MongoDB + Mongoose

**Why:** Mongoose provides flexible schemas that are well-suited for storing transcripts (hierarchical structures) and dynamic AI analysis insights (nested JSON summary, decisions, action items). 

**Alternatives considered:** PostgreSQL + Prisma (initially present, but migrated to MongoDB to support schema flexibility and user choice).

**Trade-offs:** Relational queries like overdue joins are handled through application logic and populate/aggregate patterns rather than native SQL joins, but MongoDB excels in high-write transcript storage.

## Authentication: JWT (Bearer)

**Why:** Stateless tokens are easy for API evaluators and Swagger “Authorize” flows. No server-side session store needed.

**Alternatives considered:** Session cookies (better for browser apps, harder for pure API testing).

**Trade-offs:** Tokens cannot be revoked without a denylist; acceptable for this assignment scope.

## AI Provider: OpenAI

**Why:** Reliable `response_format: json_object`, good instruction-following for citation rules.

**Alternatives considered:** Groq (faster/cheaper), Claude, Gemini — all viable with the same prompt/validation layer.

**Trade-offs:** API cost and key management; analysis fails closed if key missing.

## External Integration: Resend Email

**Why:** User-selected. Email is a natural channel for overdue action-item reminders; Resend has a simple API and test sender for development.

**Alternatives considered:** Slack/Discord webhooks (simpler setup but less like “reminder to assignee”); Telegram bot.

**Trade-offs:** Requires verified sender domain for production; reminders go to `REMINDER_TO_EMAIL` for demo (configurable).

## Architecture: Layered Monolith

**Why:** Single deployable unit — routes → controllers → services → Prisma. Clear separation without microservice overhead for a 6–10h scope.

**Structure:**
- `middleware/` — trace ID, auth, validation, errors
- `services/` — business logic
- `integrations/` — OpenAI, Resend
- `jobs/` — node-cron reminder scheduler

## Scheduler: node-cron (in-process)

**Why:** Matches assignment examples; no Redis/queue required.

**Alternatives considered:** Bull/BullMQ + Redis (better at scale), platform cron hitting an endpoint.

**Trade-offs:** Runs only while the Node process is alive; on Render free tier, instance may sleep — document for evaluators.

## Citation Validation: Post-LLM + Retry

**Why:** LLMs can hallucinate despite prompts. Server-side validation against transcript timestamps is the enforcement layer.

**Trade-offs:** One retry adds latency; invalid output after retry returns `AI_ANALYSIS_FAILED`.

## API Response Format

**Why:** Assignment requires unified `{ traceId, success, data|error }` on business APIs. `/health` kept as bare `{ status: "UP" }` for evaluator compatibility.

## CORS: `origin: '*'`

**Why:** Explicit deployment requirement for public evaluation.
