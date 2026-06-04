import request from 'supertest';
import { createApp } from '../../src/app';
import { resetDatabase, registerAndLogin, sampleTranscript } from '../helpers';

jest.mock('../../src/integrations/openai.client', () => ({
  openAiClient: {
    analyzeTranscript: jest.fn().mockResolvedValue({
      summary: [
        {
          text: 'Team plans to launch next Friday.',
          citations: [{ timestamp: '00:10' }],
        },
      ],
      actionItems: [
        {
          task: 'Prepare release notes',
          assignee: 'Alice',
          citations: [{ timestamp: '00:20' }],
        },
      ],
      decisions: [],
      followUpSuggestions: [
        {
          text: 'Confirm launch date',
          citations: [{ timestamp: '00:10' }],
        },
      ],
    }),
  },
}));

const app = createApp();

describe('Meeting Intelligence API', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  describe('health & evaluation', () => {
    it('GET /health returns UP', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'UP' });
    });

    it('GET /api/evaluation returns candidate info', async () => {
      const res = await request(app).get('/api/evaluation');
      expect(res.status).toBe(200);
      expect(res.body.candidateName).toBeDefined();
      expect(res.body.externalIntegration).toContain('Resend');
    });
  });

  describe('auth', () => {
    it('registers and logs in', async () => {
      const register = await request(app).post('/api/auth/register').send({
        email: 'alice@test.com',
        password: 'password123',
      });
      expect(register.status).toBe(201);
      expect(register.body.success).toBe(true);
      expect(register.body.traceId).toBeDefined();
      expect(register.body.data.token).toBeDefined();

      const login = await request(app).post('/api/auth/login').send({
        email: 'alice@test.com',
        password: 'password123',
      });
      expect(login.status).toBe(200);
      expect(login.body.data.token).toBeDefined();
    });

    it('returns 401 without token on protected route', async () => {
      const res = await request(app).get('/api/meetings');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('meetings', () => {
    it('creates and lists meetings', async () => {
      const token = await registerAndLogin(app);

      const create = await request(app)
        .post('/api/meetings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Sprint Planning',
          participants: ['alice@example.com'],
          meetingDate: '2026-05-20T10:00:00.000Z',
          transcript: sampleTranscript,
        });

      expect(create.status).toBe(201);
      expect(create.body.data.title).toBe('Sprint Planning');
      expect(create.body.data.transcript).toHaveLength(2);

      const list = await request(app)
        .get('/api/meetings?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);

      expect(list.status).toBe(200);
      expect(list.body.data.items).toHaveLength(1);
      expect(list.body.data.total).toBe(1);
    });

    it('returns validation error for missing title', async () => {
      const token = await registerAndLogin(app);
      const res = await request(app)
        .post('/api/meetings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          participants: [],
          meetingDate: '2026-05-20T10:00:00.000Z',
          transcript: sampleTranscript,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('analyzes meeting with citations', async () => {
      const token = await registerAndLogin(app);

      const create = await request(app)
        .post('/api/meetings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Sprint Planning',
          participants: ['alice@example.com'],
          meetingDate: '2026-05-20T10:00:00.000Z',
          transcript: sampleTranscript,
        });

      const meetingId = create.body.data.id;

      const analyze = await request(app)
        .post(`/api/meetings/${meetingId}/analyze`)
        .set('Authorization', `Bearer ${token}`);

      expect(analyze.status).toBe(200);
      expect(analyze.body.data.summary[0].citations[0].timestamp).toBe('00:10');
      expect(analyze.body.data.actionItems[0].task).toContain('release notes');
    });
  });

  describe('action items', () => {
    it('creates, updates status, lists and finds overdue', async () => {
      const token = await registerAndLogin(app);

      const createMeeting = await request(app)
        .post('/api/meetings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Standup',
          participants: [],
          meetingDate: '2026-05-20T10:00:00.000Z',
          transcript: sampleTranscript,
        });

      const meetingId = createMeeting.body.data.id;

      const createItem = await request(app)
        .post('/api/action-items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          task: 'Prepare release notes',
          assignee: 'Alice',
          meetingId,
          dueDate: '2020-01-01T00:00:00.000Z',
          citations: [{ timestamp: '00:20' }],
        });

      expect(createItem.status).toBe(201);
      const itemId = createItem.body.data.id;

      const patch = await request(app)
        .patch(`/api/action-items/${itemId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'IN_PROGRESS' });

      expect(patch.status).toBe(200);
      expect(patch.body.data.status).toBe('IN_PROGRESS');

      const overdue = await request(app)
        .get('/api/action-items/overdue')
        .set('Authorization', `Bearer ${token}`);

      expect(overdue.status).toBe(200);
      expect(overdue.body.data.items.length).toBeGreaterThanOrEqual(1);

      const list = await request(app)
        .get('/api/action-items?status=IN_PROGRESS')
        .set('Authorization', `Bearer ${token}`);

      expect(list.status).toBe(200);
      expect(list.body.data.items[0].status).toBe('IN_PROGRESS');
    });
  });
});
