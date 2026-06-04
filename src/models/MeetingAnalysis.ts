import mongoose, { Schema, Document } from 'mongoose';

export interface IMeetingAnalysis extends Document {
  meetingId: mongoose.Types.ObjectId;
  summary: any;
  decisions: any;
  followUpSuggestions: any;
  actionItems: any;
  createdAt: Date;
}

const MeetingAnalysisSchema = new Schema<IMeetingAnalysis>(
  {
    meetingId: { type: Schema.Types.ObjectId, required: true, ref: 'Meeting' },
    summary: { type: Schema.Types.Mixed, required: true },
    decisions: { type: Schema.Types.Mixed, required: true },
    followUpSuggestions: { type: Schema.Types.Mixed, required: true },
    actionItems: { type: Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

MeetingAnalysisSchema.index({ meetingId: 1 });

export const MeetingAnalysis = mongoose.model<IMeetingAnalysis>('MeetingAnalysis', MeetingAnalysisSchema);
