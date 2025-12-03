import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'like' | 'comment' | 'connection' | 'message';
  message: string;
  relatedId: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'connection', 'message'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
