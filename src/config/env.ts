import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  OPENAI_API_KEY: z.preprocess((val) => (val === '' ? undefined : val), z.string().optional()),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  RESEND_API_KEY: z.preprocess((val) => (val === '' ? undefined : val), z.string().optional()),
  RESEND_FROM_EMAIL: z.preprocess((val) => (val === '' ? undefined : val), z.string().email().optional()),
  REMINDER_TO_EMAIL: z.preprocess((val) => (val === '' ? undefined : val), z.string().email().optional()),
  CRON_REMINDER_SCHEDULE: z.string().default('0 */6 * * *'),
  REMINDER_COOLDOWN_HOURS: z.coerce.number().default(24),
  CANDIDATE_NAME: z.string().default('Candidate'),
  CANDIDATE_EMAIL: z.string().email().default('candidate@example.com'),
  REPOSITORY_URL: z.string().url().default('https://github.com/example/hintro-ai'),
  DEPLOYED_URL: z.string().url().default('http://localhost:3000'),
});

export type Env = z.infer<typeof envSchema>;

function applyTestDefaults(): void {
  if (process.env.NODE_ENV === 'test') {
    process.env.DATABASE_URL ??=
      'mongodb://127.0.0.1:27017/hintro_ai_test';
    process.env.JWT_SECRET ??= 'test-jwt-secret-key-32chars!!';
    process.env.JWT_EXPIRES_IN ??= '1h';
    process.env.CANDIDATE_NAME ??= 'Test Candidate';
    process.env.CANDIDATE_EMAIL ??= 'test@example.com';
    process.env.REPOSITORY_URL ??= 'https://github.com/example/hintro-ai';
    process.env.DEPLOYED_URL ??= 'http://localhost:3000';
  }
}

function loadEnv(): Env {
  applyTestDefaults();
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${message}`);
  }
  return parsed.data;
}

export const env = loadEnv();
