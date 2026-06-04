import mongoose, { Schema, Document } from 'mongoose';

export enum ActionItemStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export interface IActionItem extends Document {
  userId: mongoose.Types.ObjectId;
  meetingId?: mongoose.Types.ObjectId;
  task: string;
  assignee?: string;
  status: ActionItemStatus;
  dueDate?: Date;
  citations: any;
  createdAt: Date;
  updatedAt: Date;
}

const ActionItemSchema = new Schema<IActionItem>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    meetingId: { type: Schema.Types.ObjectId, ref: 'Meeting' },
    task: { type: String, required: true },
    assignee: { type: String },
    status: {
      type: String,
      enum: Object.values(ActionItemStatus),
      default: ActionItemStatus.PENDING,
    },
    dueDate: { type: Date },
    citations: { type: Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ActionItemSchema.index({ userId: 1 });
ActionItemSchema.index({ meetingId: 1 });
ActionItemSchema.index({ status: 1 });
ActionItemSchema.index({ dueDate: 1 });
ActionItemSchema.index({ assignee: 1 });

export const ActionItem = mongoose.model<IActionItem>('ActionItem', ActionItemSchema);
