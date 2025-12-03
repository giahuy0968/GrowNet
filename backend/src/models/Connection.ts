import mongoose, { Document, Schema } from 'mongoose';

export interface IConnection extends Document {
  userId1: mongoose.Types.ObjectId;
  userId2: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

const ConnectionSchema = new Schema<IConnection>({
  userId1: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userId2: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'blocked'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes
ConnectionSchema.index({ userId1: 1, userId2: 1 });
ConnectionSchema.index({ status: 1 });

export default mongoose.model<IConnection>('Connection', ConnectionSchema);
