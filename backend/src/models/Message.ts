import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  chatId: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  fileUrl: {
    type: String
  },
  readBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Indexes
MessageSchema.index({ chatId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });

export default mongoose.model<IMessage>('Message', MessageSchema);
