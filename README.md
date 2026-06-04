# Hintro Meeting Intelligence Service

AI-powered meeting intelligence API: store meetings and transcripts, generate grounded insights with citations, manage action items, detect overdue tasks, and send email reminders via Resend.

## Live URLs

| Resource | URL |
|----------|-----|
| API (deploy) | Set `DEPLOYED_URL` in env — update after Render deploy |
| Swagger UI | `{DEPLOYED_URL}/api-docs` |
| OpenAPI JSON | `{DEPLOYED_URL}/api-docs.json` |
| Health | `{DEPLOYED_URL}/health` |
| Evaluation | `{DEPLOYED_URL}/api/evaluation` |

## Tech Stack

- Node.js 20 + TypeScript + Express
- PostgreSQL + Prisma ORM
- JWT authentication
- OpenAI (structured JSON analysis)
- Resend (overdue reminder emails)
- node-cron (scheduled reminders)
- Swagger UI at `/api-docs`

## Prerequisites

- Node.js 20+
- PostgreSQL 16+ (local via Docker Compose or hosted)
- OpenAI API key (for `/analyze`)
- Resend API key (for reminder emails)

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Min 16 characters |
| `JWT_EXPIRES_IN` | No | Default `7d` |
| `OPENAI_API_KEY` | For analyze | OpenAI API key |
| `OPENAI_MODEL` | No | Default `gpt-4o-mini` |
| `RESEND_API_KEY` | For reminders | Resend API key |
| `RESEND_FROM_EMAIL` | For reminders | Verified sender (e.g. `onboarding@resend.dev` for testing) |
| `REMINDER_TO_EMAIL` | For reminders | Recipient for overdue reminders |
| `CRON_REMINDER_SCHEDULE` | No | Cron expression, default `0 */6 * * *` |
| `REMINDER_COOLDOWN_HOURS` | No | Default `24` |
| `CANDIDATE_*` | For evaluation | Name, email, repo URL, deployed URL |
| `PORT` | No | Default `3000` |

## Local Setup

### 1. Start PostgreSQL

```bash
docker compose up -d
```

Creates database `hintro_ai` at `localhost:5432`.

### 2. Install and migrate

```bash
npm install
npx prisma migrate deploy
npm run dev
```

Server: http://localhost:3000  
Swagger: http://localhost:3000/api-docs

### 3. Production build

```bash
npm run build
npm start
```

## Database Schema

See [prisma/schema.prisma](prisma/schema.prisma):

- **User** — auth accounts
- **Meeting** — title, participants, meetingDate
- **TranscriptSegment** — timestamp, speaker, text (ordered)
- **MeetingAnalysis** — AI output snapshots (JSON)
- **ActionItem** — task, assignee, status, dueDate, citations
- **ReminderLog** — email reminder history

**Overdue rule:** `status != COMPLETED` AND `dueDate < now()`.

## API Usage Examples

### Register & login

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123","name":"Alice"}'

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
```

Save `data.token` from the response.

### Create meeting

```bash
curl -X POST http://localhost:3000/api/meetings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Trace-Id: $(uuidgen 2>/dev/null || echo 00000000-0000-4000-8000-000000000001)" \
  -d '{
    "title": "Sprint Planning",
    "participants": ["alice@example.com","bob@example.com"],
    "meetingDate": "2026-05-20T10:00:00Z",
    "transcript": [
      {"timestamp":"00:10","speaker":"John","text":"We should launch next Friday."},
      {"timestamp":"00:20","speaker":"Alice","text":"I will prepare release notes."}
    ]
  }'
```

### Analyze meeting

```bash
curl -X POST http://localhost:3000/api/meetings/MEETING_ID/analyze \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response includes `summary`, `actionItems`, `decisions`, `followUpSuggestions` — each with `citations[].timestamp`.

### Action items

```bash
# Create
curl -X POST http://localhost:3000/api/action-items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task":"Prepare release notes",
    "assignee":"Alice",
    "meetingId":"MEETING_ID",
    "dueDate":"2026-05-25T00:00:00Z",
    "citations":[{"timestamp":"00:20"}]
  }'

# Update status
curl -X PATCH http://localhost:3000/api/action-items/ITEM_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"IN_PROGRESS"}'

# List overdue
curl http://localhost:3000/api/action-items/overdue \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Unified response format

Success:

```json
{ "traceId": "...", "success": true, "data": {} }
```

Error:

```json
{
  "traceId": "...",
  "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "Meeting title is required" }
}
```

`/health` returns `{ "status": "UP" }` exactly (no wrapper).

## Testing

```bash
# Unit tests (no database)
npm run test:unit

# Integration tests (requires PostgreSQL + migrations)
createdb hintro_ai_test   # once
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hintro_ai_test npx prisma migrate deploy
npm run test:integration

# All tests
npm test
```

## Deployment (Render)

1. Push repo to GitHub.
2. Create **Render PostgreSQL** + **Web Service** (or use [render.yaml](render.yaml) Blueprint).
3. Set environment variables (see `.env.example`).
4. Build command: `npm ci && npx prisma generate && npx prisma migrate deploy && npm run build`
5. Start command: `node dist/server.js`
6. Update `DEPLOYED_URL`, `REPOSITORY_URL`, `CANDIDATE_*` in Render dashboard.
7. Verify `/health`, `/api-docs`, `/api/evaluation`.

**CORS:** enabled for `*` on all routes.

## Project Docs

- [DECISIONS.md](DECISIONS.md) — architecture & technology choices
- [AI_APPROACH.md](AI_APPROACH.md) — prompts, citations, hallucination prevention
- [TESTING.md](TESTING.md) — test strategy
- [CHANGELOG.md](CHANGELOG.md) — implementation log
- [CHECKLIST.md](CHECKLIST.md) — submission checklist

## Authentication

**JWT Bearer tokens** protect all `/api/meetings` and `/api/action-items` routes. Register or login to obtain a token. Rationale documented in DECISIONS.md.
