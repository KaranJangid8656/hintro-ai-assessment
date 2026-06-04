import { Resend } from 'resend';
import { env } from '../config/env';
import { ExternalServiceError } from '../lib/errors';

export interface ReminderEmailPayload {
  task: string;
  assignee?: string | null;
  dueDate?: Date | null;
  meetingTitle?: string | null;
}

export class ResendClient {
  private client: Resend | null = null;

  private getClient(): Resend {
    if (!env.RESEND_API_KEY) {
      throw new ExternalServiceError('Resend API key is not configured');
    }
    if (!this.client) {
      this.client = new Resend(env.RESEND_API_KEY);
    }
    return this.client;
  }

  async sendReminderEmail(to: string, payload: ReminderEmailPayload, traceId?: string) {
    if (!env.RESEND_FROM_EMAIL) {
      throw new ExternalServiceError('RESEND_FROM_EMAIL is not configured');
    }

    const dueDateStr = payload.dueDate
      ? payload.dueDate.toISOString().split('T')[0]
      : 'Not set';
    const assignee = payload.assignee ?? 'Unassigned';
    const meeting = payload.meetingTitle ?? 'N/A';

    const text = `Reminder: ${payload.task}
Assigned To: ${assignee}
Due Date: ${dueDateStr}
Meeting: ${meeting}`;

    const html = `
      <h2>Action Item Reminder</h2>
      <p><strong>Reminder:</strong> ${payload.task}</p>
      <p><strong>Assigned To:</strong> ${assignee}</p>
      <p><strong>Due Date:</strong> ${dueDateStr}</p>
      <p><strong>Meeting:</strong> ${meeting}</p>
      ${traceId ? `<p><small>Trace ID: ${traceId}</small></p>` : ''}
    `;

    const client = this.getClient();
    const result = await client.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to,
      subject: `Reminder: ${payload.task}`,
      text,
      html,
    });

    if (result.error) {
      throw new ExternalServiceError(result.error.message, result.error);
    }

    return result.data;
  }
}

export const resendClient = new ResendClient();
