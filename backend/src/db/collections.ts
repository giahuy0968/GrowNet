import { MongoClient, Db, Collection, Document } from 'mongodb'
import { env } from '../config/env'

let client: MongoClient | null = null
let db: Db | null = null

export async function connectMongoClient(uri: string = env.mongoUri) {
    if (client && db) return db
    client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
    })
    await client.connect()
    db = client.db('grownet')
    console.log('[DB] MongoClient connected to grownet')
    return db
}

export async function disconnectMongoClient() {
    if (client) {
        await client.close()
        client = null
        db = null
        console.log('[DB] MongoClient disconnected')
    }
}

function getDb(): Db {
    if (!db) throw new Error('MongoClient is not connected')
    return db
}

// Uppercase-named collections
export const Availability = (): Collection<Document> => getDb().collection('Availability')
// Alias to match repos.ts naming
export const Availabilities = (): Collection<Document> => getDb().collection('Availability')
export const Matches = (): Collection<Document> => getDb().collection('Matches')
export const Messages = (): Collection<Document> => getDb().collection('Messages')
export const Profiles = (): Collection<Document> => getDb().collection('Profiles')
export const Ratings = (): Collection<Document> => getDb().collection('Ratings')
export const Swipes = (): Collection<Document> => getDb().collection('Swipes')
export const Users = (): Collection<Document> => getDb().collection('Users')

// Lowercase collections
export const chats = (): Collection<Document> => getDb().collection('chats')
export const connections = (): Collection<Document> => getDb().collection('connections')
export const notifications = (): Collection<Document> => getDb().collection('notifications')
export const posts = (): Collection<Document> => getDb().collection('posts')
// Uppercase plural accessors used by repos.ts
export const Chats = (): Collection<Document> => getDb().collection('chats')
export const Connections = (): Collection<Document> => getDb().collection('connections')
export const Notifications = (): Collection<Document> => getDb().collection('notifications')
export const Posts = (): Collection<Document> => getDb().collection('posts')

// Example helper to ensure collection exists and can be queried
export async function pingUsers(): Promise<void> {
    await connectMongoClient()
    const user = await Users().findOne({}, { projection: { _id: 1 } })
    console.log('[DB] Users collection reachable. Sample _id:', user?._id ?? 'none')
}
