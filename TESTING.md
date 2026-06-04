# Testing

## Test Structure

| Suite | Command | Database |
|-------|---------|----------|
| Unit | `npm run test:unit` | Not required |
| Integration | `npm run test:integration` | PostgreSQL required |
| All | `npm test` | PostgreSQL required |

## Scenarios Covered

### Unit

- **Timestamp normalization** — `0:10` → `00:10`, H:M:S conversion
- **Citation validator** — valid/invalid timestamps, assignee mismatch, empty citations
- **API response helpers** — success/error envelope shape

### Integration (mocked OpenAI)

- Health and evaluation endpoints
- Register, login, 401 without token
- Create meeting with transcript
- Validation error (missing title)
- Analyze meeting — mocked LLM returns grounded JSON; citations verified in response
- Action items: create, status patch, list filter, overdue detection

## Edge Cases Considered

- Invalid JWT → 401
- Missing required fields → `VALIDATION_ERROR` with trace ID
- Citations must reference existing transcript timestamps when `meetingId` provided
- Overdue items: `dueDate` in past and status not `COMPLETED`
- Duplicate email registration → 409

## Mocks

- **OpenAI:** Jest mock in `tests/integration/api.test.ts` returns fixed analysis JSON
- **Resend:** Not called in integration tests (no overdue cron in test `NODE_ENV`)

## Manual Testing

1. Start Postgres + app with real `OPENAI_API_KEY`
2. Create meeting → analyze → verify citations match transcript
3. Create action item with past `dueDate`
4. Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `REMINDER_TO_EMAIL`
5. Trigger cron manually or wait for schedule; check `ReminderLog` table

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs migrations against Postgres service and executes full `npm test`.

## Limitations

- Integration tests require local Postgres on port 5432 (or `DATABASE_URL` override)
- Reminder cron disabled when `NODE_ENV=test`
- No live OpenAI/Resend calls in automated tests
