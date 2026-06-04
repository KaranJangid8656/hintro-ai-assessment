import request from 'supertest';
import type { Express } from 'express';
import {
  User,
  Meeting,
  TranscriptSegment,
  MeetingAnalysis,
  ActionItem,
  ReminderLog,
} from '../src/models';

export async function resetDatabase() {
  await ReminderLog.deleteMany({});
  await ActionItem.deleteMany({});
  await MeetingAnalysis.deleteMany({});
  await TranscriptSegment.deleteMany({});
  await Meeting.deleteMany({});
  await User.deleteMany({});
}

export async function registerAndLogin(app: Express, email = 'user@test.com') {
  await request(app).post('/api/auth/register').send({
    email,
    password: 'password123',
    name: 'Test User',
  });

  const login = await request(app).post('/api/auth/login').send({
    email,
    password: 'password123',
  });

  return login.body.data.token as string;
}

export const sampleTranscript = [
  {
    timestamp: '00:10',
    speaker: 'John',
    text: 'We should launch next Friday.',
  },
  {
    timestamp: '00:20',
    speaker: 'Alice',
    text: 'I will prepare release notes.',
  },
];
