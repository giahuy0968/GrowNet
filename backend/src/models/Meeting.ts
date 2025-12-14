import mongoose, { Schema, Document } from 'mongoose';

interface Attendee {
  userId?: mongoose.Types.ObjectId;
  email: string;
  responseStatus?: string;
}

export interface IMeeting extends Document {
  chatId: mongoose.Types.ObjectId;
  organizerId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees: Attendee[];
  videoLink?: string;
  provider: 'google_meet' | 'zoom' | 'custom';
  calendarEventId: string;
  calendarId: string;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema<IMeeting>({
  chatId: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  organizerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  attendees: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      email: {
        type: String,
        required: true
      },
      responseStatus: String
    }
  ],
  videoLink: String,
  provider: {
    type: String,
    enum: ['google_meet', 'zoom', 'custom'],
    default: 'google_meet'
  },
  calendarEventId: {
    type: String,
    required: true
  },
  calendarId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

MeetingSchema.index({ chatId: 1, startTime: -1 });

export default mongoose.model<IMeeting>('Meeting', MeetingSchema);
