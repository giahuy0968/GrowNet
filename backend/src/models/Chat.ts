import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
    participants: mongoose.Types.ObjectId[];
    lastMessage?: mongoose.Types.ObjectId;
    unreadCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const ChatSchema: Schema = new Schema(
    {
        participants: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }],
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: 'Message',
        },
        unreadCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true, // Tự động tạo createdAt và updatedAt
    }
);

// Đảm bảo mỗi cặp participants là duy nhất
ChatSchema.index({ participants: 1 }, { unique: true });

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);