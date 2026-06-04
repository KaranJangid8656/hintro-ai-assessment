# Changelog

## [1.1.0] - 2026-06-04

### Changed

- Migrated entire service database connection and models from PostgreSQL + Prisma to MongoDB + Mongoose.
- Updated Zod input validation schemas to validate 24-character hexadecimal MongoDB ObjectIDs instead of UUIDs.
- Reconfigured Jest integration test database teardown and setup to use Mongoose connections.
- Refactored `User` model to remove duplicate email indexing and resolve Mongoose index warnings.
- Updated Mongoose update queries to use `returnDocument: 'after'` instead of deprecated `{ new: true }` option.
- Cleaned up leftover Prisma files and folders.
- Updated Docker configuration (`docker-compose.yml`) to spin up MongoDB instead of PostgreSQL.
- Updated CI/CD (`.github/workflows/ci.yml`) to run MongoDB service instead of PostgreSQL.
- Updated technical documentation (`README.md`, `DECISIONS.md`, `TESTING.md`, `CHECKLIST.md`, `render.yaml`) to reflect MongoDB architecture.

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
