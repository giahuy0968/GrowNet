import { ObjectId } from 'mongodb'
import {
    Users,
    Profiles,
    Messages,
    Matches,
    Ratings,
    Swipes,
    Availabilities,
    Chats,
    Connections,
    Notifications,
    Posts
} from './collections'
import {
    UserDoc,
    ProfileDoc,
    MessageDoc,
    MatchDoc,
    RatingDoc,
    SwipeDoc,
    AvailabilityDoc,
    ChatDoc,
    ConnectionDoc,
    NotificationDoc,
    PostDoc
} from './types'

// Helper để convert ObjectId sang string
const toObjectId = (id: string | ObjectId): ObjectId =>
    id instanceof ObjectId ? id : new ObjectId(id)

const toIdString = (id: string | ObjectId): string =>
    id instanceof ObjectId ? id.toHexString() : id

// 1. User functions
export async function getUserById(id: string): Promise<UserDoc | null> {
    const user = await Users().findOne({ _id: toObjectId(id) })
    return user ? ({ ...user, _id: toIdString(user._id) } as UserDoc) : null
}

export async function createUser(userData: Omit<UserDoc, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const doc: Partial<UserDoc> = {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
    }

    const res = await Users().insertOne(doc as any)
    return toIdString(res.insertedId)
}

export async function updateUser(id: string, updates: Partial<UserDoc>): Promise<void> {
    await Users().updateOne(
        { _id: toObjectId(id) },
        {
            $set: {
                ...updates,
                updatedAt: new Date()
            }
        }
    )
}

// 2. Profile functions
export async function upsertProfile(userId: string, patch: Partial<ProfileDoc>): Promise<void> {
    await Profiles().updateOne(
        { userId: toObjectId(userId) },
        {
            $set: {
                ...patch,
                updatedAt: new Date()
            },
            $setOnInsert: {
                userId: toObjectId(userId),
                createdAt: new Date()
            }
        },
        { upsert: true }
    )
}

export async function getProfileByUserId(userId: string): Promise<ProfileDoc | null> {
    const profile = await Profiles().findOne({ userId: toObjectId(userId) })
    return profile ? {
        ...profile,
        _id: toIdString(profile._id),
        userId: toIdString(profile.userId)
    } : null
}

// 3. Message functions
export async function addMessage(data: Omit<MessageDoc, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const doc: MessageDoc = {
        ...data,
        sentAt: data.sentAt ?? new Date(),
        isRead: data.isRead ?? false,
        createdAt: new Date(),
        updatedAt: new Date()
    }

    const res = await Messages().insertOne({
        ...doc,
        _id: new ObjectId(),
        senderId: toObjectId(doc.senderId),
        receiverId: toObjectId(doc.receiverId)
    } as any)

    return toIdString(res.insertedId)
}

export async function listMessagesBetween(userId1: string, userId2: string): Promise<MessageDoc[]> {
    const id1 = toObjectId(userId1)
    const id2 = toObjectId(userId2)

    const messages = await Messages()
        .find({
            $or: [
                { senderId: id1, receiverId: id2 },
                { senderId: id2, receiverId: id1 }
            ]
        })
        .sort({ sentAt: 1 })
        .toArray()

    return messages.map(msg => ({
        ...msg,
        _id: toIdString(msg._id),
        senderId: toIdString(msg.senderId),
        receiverId: toIdString(msg.receiverId)
    }) as MessageDoc)
}

export async function markMessageAsRead(messageId: string): Promise<void> {
    await Messages().updateOne(
        { _id: toObjectId(messageId) },
        {
            $set: {
                isRead: true,
                updatedAt: new Date()
            }
        }
    )
}

// 4. Match functions
export async function createMatch(
    menteeId: string,
    mentorId: string,
    status: MatchDoc['status'] = 'pending'
): Promise<string> {
    const doc: MatchDoc = {
        menteeId,
        mentorId,
        status,
        createdAt: new Date(),
        updatedAt: new Date()
    }

    const res = await Matches().insertOne({
        ...doc,
        _id: new ObjectId(),
        menteeId: toObjectId(menteeId),
        mentorId: toObjectId(mentorId)
    } as any)

    return toIdString(res.insertedId)
}

export async function listMatchesForUser(userId: string): Promise<MatchDoc[]> {
    const id = toObjectId(userId)

    const matches = await Matches()
        .find({
            $or: [
                { menteeId: id },
                { mentorId: id }
            ]
        })
        .toArray()

    return matches.map(match => ({
        ...match,
        _id: toIdString(match._id),
        menteeId: toIdString(match.menteeId),
        mentorId: toIdString(match.mentorId)
    }) as MatchDoc)
}

export async function updateMatchStatus(matchId: string, status: MatchDoc['status']): Promise<void> {
    await Matches().updateOne(
        { _id: toObjectId(matchId) },
        {
            $set: {
                status,
                updatedAt: new Date()
            }
        }
    )
}

// 5. Rating functions
export async function rateUser(
    raterId: string,
    ratedId: string,
    matchId: string,
    score: number,
    comment?: string
): Promise<string> {
    const doc: RatingDoc = {
        raterId,
        ratedId,
        matchId,
        score,
        comment,
        createdAt: new Date(),
        updatedAt: new Date()
    }

    const res = await Ratings().insertOne({
        ...doc,
        _id: new ObjectId(),
        raterId: toObjectId(raterId),
        ratedId: toObjectId(ratedId),
        matchId: toObjectId(matchId)
    } as any)

    return toIdString(res.insertedId)
}

export async function getRatingsForUser(userId: string): Promise<RatingDoc[]> {
    const ratings = await Ratings()
        .find({ ratedId: toObjectId(userId) })
        .toArray()

    return ratings.map(rating => ({
        ...rating,
        _id: toIdString(rating._id),
        raterId: toIdString(rating.raterId),
        ratedId: toIdString(rating.ratedId),
        matchId: toIdString(rating.matchId)
    }) as RatingDoc)
}

// 6. Swipe functions
export async function recordSwipe(
    userId: string,
    targetId: string,
    liked: boolean
): Promise<string> {
    const doc: SwipeDoc = {
        userId,
        targetId,
        liked,
        createdAt: new Date(),
        updatedAt: new Date()
    }

    const res = await Swipes().insertOne({
        ...doc,
        _id: new ObjectId(),
        userId: toObjectId(userId),
        targetId: toObjectId(targetId)
    } as any)

    return toIdString(res.insertedId)
}

export async function checkPotentialMatches(userId: string): Promise<string[]> {
    const id = toObjectId(userId)

    // Tìm những người user đã swipe right (liked: true)
    const userSwipes = await Swipes()
        .find({ userId: id, liked: true })
        .toArray()

    // Tìm những người đã swipe right cho user này
    const targetSwipes = await Swipes()
        .find({ targetId: id, liked: true })
        .toArray()

    // Tìm matches (cả hai đều like nhau)
    const matches = userSwipes.filter(userSwipe =>
        targetSwipes.some(targetSwipe =>
            targetSwipe.userId.equals(userSwipe.targetId)
        )
    )

    return matches.map(swipe => toIdString(swipe.targetId))
}

// 7. Availability functions
export async function setAvailability(
    mentorId: string,
    slots: AvailabilityDoc['slots'],
    timezone?: string
): Promise<string> {
    const doc: AvailabilityDoc = {
        mentorId,
        slots,
        timezone,
        createdAt: new Date(),
        updatedAt: new Date()
    }

    const res = await Availabilities().updateOne(
        { mentorId: toObjectId(mentorId) },
        {
            $set: {
                slots,
                timezone,
                updatedAt: new Date()
            },
            $setOnInsert: {
                mentorId: toObjectId(mentorId),
                createdAt: new Date()
            }
        },
        { upsert: true }
    )

    if (res.upsertedId) {
        return toIdString(res.upsertedId)
    }

    // Nếu không upserted, lấy existing _id
    const existing = await Availabilities().findOne({ mentorId: toObjectId(mentorId) })
    return toIdString(existing!._id)
}

export async function getMentorAvailability(mentorId: string): Promise<AvailabilityDoc | null> {
    const availability = await Availabilities().findOne({ mentorId: toObjectId(mentorId) })

    return availability ? ({
        ...availability,
        _id: toIdString(availability._id),
        mentorId: toIdString(availability.mentorId)
    } as AvailabilityDoc) : null
}

// 8. Chat functions
export async function createChat(participants: string[]): Promise<string> {
    const doc: ChatDoc = {
        participants,
        createdAt: new Date(),
        updatedAt: new Date()
    }

    const res = await Chats().insertOne({
        ...doc,
        _id: new ObjectId(),
        participants: participants.map(id => toObjectId(id))
    } as any)

    return toIdString(res.insertedId)
}

export async function getUserChats(userId: string): Promise<ChatDoc[]> {
    const chats = await Chats()
        .find({ participants: toObjectId(userId) })
        .sort({ lastMessageAt: -1 })
        .toArray()

    return chats.map(chat => ({
        ...chat,
        _id: toIdString(chat._id),
        participants: chat.participants.map((id: any) => toIdString(id))
    }) as ChatDoc)
}

// 9. Connection functions
export async function createConnection(userId1: string, userId2: string): Promise<string> {
    const doc: ConnectionDoc = {
        userId1,
        userId2,
        connectedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
    }

    const res = await Connections().insertOne({
        ...doc,
        _id: new ObjectId(),
        userId1: toObjectId(userId1),
        userId2: toObjectId(userId2)
    } as any)

    return toIdString(res.insertedId)
}

// 10. Notification functions
export async function createNotification(
    userId: string,
    type: NotificationDoc['type'],
    title: string,
    message: string,
    payload?: Record<string, unknown>
): Promise<string> {
    const doc: NotificationDoc = {
        userId,
        type,
        title,
        message,
        payload,
        isSeen: false,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
    }

    const res = await Notifications().insertOne({
        ...doc,
        _id: new ObjectId(),
        userId: toObjectId(userId)
    } as any)

    return toIdString(res.insertedId)
}

export async function getUserNotifications(userId: string): Promise<NotificationDoc[]> {
    const notifications = await Notifications()
        .find({ userId: toObjectId(userId) })
        .sort({ createdAt: -1 })
        .toArray()

    return notifications.map(notif => ({
        ...notif,
        _id: toIdString(notif._id),
        userId: toIdString(notif.userId)
    }) as NotificationDoc)
}

// 11. Post functions
export async function createPost(
    authorId: string,
    content: string,
    title?: string,
    tags?: string[]
): Promise<string> {
    const doc: PostDoc = {
        authorId,
        content,
        title,
        tags,
        likes: [],
        commentsCount: 0,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }

    const res = await Posts().insertOne({
        ...doc,
        _id: new ObjectId(),
        authorId: toObjectId(authorId)
    } as any)

    return toIdString(res.insertedId)
}

export async function likePost(postId: string, userId: string): Promise<void> {
    await Posts().updateOne(
        { _id: toObjectId(postId) },
        {
            $addToSet: { likes: toObjectId(userId) },
            $set: { updatedAt: new Date() }
        }
    )
}