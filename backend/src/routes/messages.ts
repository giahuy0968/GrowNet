import express from 'express';
import { Message } from '../models/Message';
import { Chat } from '../models/Chat';
import { auth } from '../middleware/auth';

const router = express.Router();

// GET /api/messages
// Trả về 20 tin nhắn gần nhất của user hiện tại (theo createdAt desc)
router.get('/', auth, async (req, res) => {
    try {
        const currentUserId = (req as any).user?._id;
        if (!currentUserId) {
            return res.status(401).json({ error: 'Please authenticate' });
        }

        const messages = await Message.find({
            $or: [
                { sender: currentUserId },
                { receiver: currentUserId },
            ],
        })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('sender', 'username avatar')
            .populate('receiver', 'username avatar');

        res.json(messages);
    } catch (error) {
        console.error('Get recent messages error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Lấy tin nhắn giữa 2 users
router.get('/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = (req as any).user._id; // Từ auth middleware

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: userId },
                { sender: userId, receiver: currentUserId },
            ],
        })
            .sort({ createdAt: 1 })
            .populate('sender', 'username avatar')
            .populate('receiver', 'username avatar');

        res.json(messages);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Gửi tin nhắn mới
router.post('/', auth, async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = (req as any).user._id;

        if (!receiverId || !content) {
            return res.status(400).json({ error: 'Receiver ID and content are required' });
        }

        // Tạo tin nhắn mới
        const message = new Message({
            sender: senderId,
            receiver: receiverId,
            content,
        });

        await message.save();

        // Cập nhật hoặc tạo chat
        const participants = [senderId, receiverId].sort();
        await Chat.findOneAndUpdate(
            { participants },
            {
                $set: { lastMessage: message._id },
                $inc: { unreadCount: 1 },
            },
            { upsert: true, new: true }
        );

        // Populate thông tin sender/receiver để trả về
        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'username avatar')
            .populate('receiver', 'username avatar');

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Đánh dấu tin nhắn đã đọc
router.put('/:messageId/read', auth, async (req, res) => {
    try {
        const { messageId } = req.params;
        const currentUserId = (req as any).user._id;

        // SỬA ĐỔI: Thêm điều kiện receiver: currentUserId
        const message = await Message.findOneAndUpdate(
            { _id: messageId, receiver: currentUserId }, // Chỉ update nếu ID khớp VÀ người dùng hiện tại là người nhận
            { read: true },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ error: 'Message not found or unauthorized to read' });
        }

        res.json(message);
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ error: 'Failed to mark message as read' });
    }
});

export default router;