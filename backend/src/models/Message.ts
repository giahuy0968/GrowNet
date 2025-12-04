// src/models/Message.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
   sender: mongoose.Types.ObjectId;
   receiver: mongoose.Types.ObjectId;
   content: string;
   read: boolean;
   createdAt: Date;
   updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
   {
      sender: {
         type: Schema.Types.ObjectId,
         ref: 'User',
         required: true,
      },
      receiver: {
         type: Schema.Types.ObjectId,
         ref: 'User',
         required: true,
      },
      content: {
         type: String,
         required: true,
         trim: true,
         maxlength: 2000,
      },
      read: {
         type: Boolean,
         default: false,
      },
   },
   {
      timestamps: true, // Tự động tạo createdAt và updatedAt
   }
);

// Index để tìm kiếm tin nhắn nhanh hơn
MessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
MessageSchema.index({ read: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);