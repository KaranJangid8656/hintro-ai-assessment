# Changelog

## [1.0.0] - 2026-06-02

### Added

- Initial Meeting Intelligence Service implementation
- JWT authentication (register/login)
- Meeting CRUD with transcript storage, pagination, title filter
- AI meeting analysis via OpenAI with citation validation and retry
- Action item management (create, status update, list filters, overdue)
- Resend email integration for overdue reminders
- node-cron scheduled reminder job with `ReminderLog` history
- Unified API response format with trace IDs and structured logging (pino)
- Global error handling and Zod input validation
- Swagger UI at `/api-docs` and OpenAPI JSON at `/api-docs.json`
- `/health` and `/api/evaluation` endpoints
- PostgreSQL schema via Prisma migrations
- Docker Compose for local Postgres
- GitHub Actions CI workflow
- Render Blueprint (`render.yaml`)
- Documentation: README, DECISIONS, AI_APPROACH, TESTING, CHECKLIST

### Technical

- TypeScript strict mode, layered monolith architecture
- CORS enabled for all origins
