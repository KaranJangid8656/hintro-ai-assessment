process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??=
  'mongodb://127.0.0.1:27017/hintro_ai_test';
process.env.JWT_SECRET ??= 'test-jwt-secret-key-32chars!!';
process.env.JWT_EXPIRES_IN ??= '1h';
process.env.CANDIDATE_NAME ??= 'Test Candidate';
process.env.CANDIDATE_EMAIL ??= 'test@example.com';
process.env.REPOSITORY_URL ??= 'https://github.com/example/hintro-ai';
process.env.DEPLOYED_URL ??= 'http://localhost:3000';
process.env.OPENAI_API_KEY ??= 'test-key';
process.env.CRON_REMINDER_SCHEDULE ??= '0 0 1 1 *';
