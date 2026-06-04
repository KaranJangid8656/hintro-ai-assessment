import mongoose, { Schema, Document } from 'mongoose';

export interface IMeeting extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  participants: string[];
  meetingDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema<IMeeting>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String, required: true },
    participants: { type: [String], required: true },
    meetingDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

MeetingSchema.index({ userId: 1 });
MeetingSchema.index({ meetingDate: 1 });

export const Meeting = mongoose.model<IMeeting>('Meeting', MeetingSchema);
