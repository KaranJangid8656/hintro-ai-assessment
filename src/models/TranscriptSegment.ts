import mongoose, { Schema, Document } from 'mongoose';

export interface ITranscriptSegment extends Document {
  meetingId: mongoose.Types.ObjectId;
  timestamp: string;
  speaker: string;
  text: string;
  order: number;
}

const TranscriptSegmentSchema = new Schema<ITranscriptSegment>(
  {
    meetingId: { type: Schema.Types.ObjectId, required: true, ref: 'Meeting' },
    timestamp: { type: String, required: true },
    speaker: { type: String, required: true },
    text: { type: String, required: true },
    order: { type: Number, required: true },
  },
  { timestamps: true }
);

TranscriptSegmentSchema.index({ meetingId: 1 });

export const TranscriptSegment = mongoose.model<ITranscriptSegment>('TranscriptSegment', TranscriptSegmentSchema);
