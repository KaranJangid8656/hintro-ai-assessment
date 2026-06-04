import mongoose, { Schema, Document } from 'mongoose';

export interface IReminderLog extends Document {
  actionItemId: mongoose.Types.ObjectId;
  sentAt: Date;
  channel: string;
  recipient: string;
  success: boolean;
  errorMessage?: string;
  traceId?: string;
}

const ReminderLogSchema = new Schema<IReminderLog>(
  {
    actionItemId: { type: Schema.Types.ObjectId, required: true, ref: 'ActionItem' },
    sentAt: { type: Date, default: Date.now },
    channel: { type: String, required: true },
    recipient: { type: String, required: true },
    success: { type: Boolean, required: true },
    errorMessage: { type: String },
    traceId: { type: String },
  },
  { timestamps: true }
);

ReminderLogSchema.index({ actionItemId: 1 });
ReminderLogSchema.index({ sentAt: 1 });

export const ReminderLog = mongoose.model<IReminderLog>('ReminderLog', ReminderLogSchema);
