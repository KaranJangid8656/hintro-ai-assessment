import type { Response } from 'express';
import { sendError, sendSuccess } from '../../src/lib/apiResponse';

function createMockResponse() {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res as Response & { body: Record<string, unknown>; statusCode: number };
}

describe('apiResponse', () => {
  it('sendSuccess wraps data with traceId', () => {
    const res = createMockResponse();
    sendSuccess(res, 'trace-1', { ok: true });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ traceId: 'trace-1', success: true, data: { ok: true } });
  });

  it('sendError wraps error with traceId', () => {
    const res = createMockResponse();
    sendError(res, 'trace-2', { code: 'VALIDATION_ERROR', message: 'Bad input' }, 400);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect((res.body.error as { code: string }).code).toBe('VALIDATION_ERROR');
  });
});
