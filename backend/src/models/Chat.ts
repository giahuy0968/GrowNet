import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  type: 'private' | 'group';
  participants: mongoose.Types.ObjectId[];
  name?: string;
  lastMessage?: {
    content: string;
    senderId: mongoose.Types.ObjectId;
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>({
  type: {
    type: String,
    enum: ['private', 'group'],
    default: 'private'
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  name: {
    type: String,
    trim: true
  },
  lastMessage: {
    content: String,
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date
  }
}, {
  timestamps: true
});

// Indexes
ChatSchema.index({ participants: 1 });
ChatSchema.index({ updatedAt: -1 });

export default mongoose.model<IChat>('Chat', ChatSchema);
