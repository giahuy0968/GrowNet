// Base interface với consistent naming
export interface BaseDoc {
    _id?: string | number
    createdAt?: Date
    updatedAt?: Date
}

// User - Đặt tất cả timestamps dưới dạng camelCase
export interface UserDoc extends BaseDoc {
    _id?: string
    role: 'mentee' | 'mentor' | 'admin'  // Nên là bắt buộc
    email: string
    passwordHash: string
    createdAt?: Date  // camelCase thống nhất
    avatarUrl?: string
    name?: string  // Thêm name vào User để dễ truy cập
}

// Profile - Dùng camelCase cho tất cả
export interface ProfileDoc extends BaseDoc {
    userId: string  // camelCase
    headline?: string
    location?: string
    languages?: string[]
    skills?: string[]
    goals?: string
    expertise?: string
    verified?: boolean
    gender?: string
    birthdate?: Date
    // Đã bỏ name vì có trong UserDoc
}

// Message - Thống nhất camelCase
export interface MessageDoc extends BaseDoc {
    _id?: string
    senderId: string  // camelCase
    receiverId: string  // camelCase
    content: string
    sentAt?: Date  // camelCase
    isRead?: boolean  // camelCase
}

// Match - Thống nhất camelCase
export interface MatchDoc extends BaseDoc {
    _id?: string
    menteeId: string  // camelCase
    mentorId: string  // camelCase
    createdAt?: Date  // camelCase thống nhất với BaseDoc
    status: 'accepted' | 'pending' | 'rejected' | 'cancelled'  // Thêm cancelled
    matchScore?: number  // Có thể thêm điểm matching
}

// Rating - Thống nhất camelCase
export interface RatingDoc extends BaseDoc {
    _id?: string
    matchId: string  // camelCase
    raterId: string  // camelCase
    ratedId: string  // Thêm trường này để biết ai được đánh giá
    score: number
    comment?: string
    createdAt?: Date  // camelCase
}

// Availability - Thống nhất camelCase
export interface AvailabilityDoc extends BaseDoc {
    _id?: string
    mentorId: string  // camelCase
    slots: {
        start: Date
        end: Date
        isBooked?: boolean  // Thêm trạng thái booking
        bookedBy?: string   // Ai đã book slot này
    }[]
    timezone?: string  // camelCase
    recurrence?: 'daily' | 'weekly' | 'none'  // Thêm tính năng lặp lại
}

// Swipe - Thống nhất camelCase
export interface SwipeDoc extends BaseDoc {
    _id?: string
    userId: string  // camelCase
    targetId: string  // camelCase
    liked: boolean
    createdAt?: Date  // camelCase
    // Có thể thêm swipeType?: 'mentor' | 'mentee'
}

// Chat - Đã tốt, nhưng có thể cải thiện
export interface ChatDoc extends BaseDoc {
    _id?: string
    participants: string[]  // Mảng userIds
    lastMessage?: string  // Preview tin nhắn cuối
    lastMessageAt?: Date
    chatType?: 'direct' | 'group'
    name?: string  // Tên chat (cho group)
}

// Connection - Thống nhất camelCase
export interface ConnectionDoc extends BaseDoc {
    _id?: string
    userId1: string  // camelCase
    userId2: string  // camelCase
    connectedAt?: Date  // camelCase
    connectionType?: 'mentorship' | 'peer' | 'colleague'
    status?: 'active' | 'inactive'
}

// Notification - Thêm enum cho type
export interface NotificationDoc extends BaseDoc {
    _id?: string
    userId: string
    type: 'match' | 'message' | 'rating' | 'system' | 'reminder'
    title: string  // Thêm title
    message: string  // Message là bắt buộc
    payload?: Record<string, unknown>
    isSeen?: boolean  // camelCase
    isRead?: boolean  // camelCase
    actionUrl?: string  // URL để navigate khi click
}

// Post - Thêm nhiều tính năng hơn
export interface PostDoc extends BaseDoc {
    _id?: string
    authorId: string
    content: string
    title?: string  // Thêm title
    tags?: string[]  // Thêm tags
    category?: 'question' | 'advice' | 'experience'
    likes?: string[]  // Mảng userIds đã like
    commentsCount?: number
    isPublic?: boolean
    createdAt?: Date  // Đã có trong BaseDoc, có thể không cần khai báo lại
}