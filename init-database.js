// GrowNet Database Schema & Sample Data
// Run this script on MongoDB to initialize the database

// Switch to grownet database
use grownet;

// ============================================
// 1. CREATE COLLECTIONS
// ============================================

db.createCollection('users');
db.createCollection('posts');
db.createCollection('chats');
db.createCollection('messages');
db.createCollection('connections');
db.createCollection('notifications');

// ============================================
// 2. CREATE INDEXES (for performance)
// ============================================

// Users indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "createdAt": -1 });

// Posts indexes
db.posts.createIndex({ "authorId": 1 });
db.posts.createIndex({ "createdAt": -1 });
db.posts.createIndex({ "authorId": 1, "createdAt": -1 });

// Messages indexes
db.messages.createIndex({ "chatId": 1, "createdAt": -1 });
db.messages.createIndex({ "senderId": 1 });

// Connections indexes
db.connections.createIndex({ "userId1": 1, "userId2": 1 });
db.connections.createIndex({ "status": 1 });

// Chats indexes
db.chats.createIndex({ "participants": 1 });
db.chats.createIndex({ "updatedAt": -1 });

// Notifications indexes
db.notifications.createIndex({ "userId": 1, "read": 1 });
db.notifications.createIndex({ "createdAt": -1 });

// ============================================
// 3. INSERT SAMPLE DATA
// ============================================

print('Creating sample users...');

// Sample Users
const users = [
  {
    _id: ObjectId(),
    username: "john_doe",
    email: "john@grownet.com",
    password: "$2b$10$XQlL8VK3MqnQQQ1LxQqQQu", // Remember to hash in production!
    fullName: "John Doe",
    bio: "Tech enthusiast | Coffee lover | Traveler",
    avatar: "https://i.pravatar.cc/150?img=1",
    interests: ["technology", "travel", "photography", "coffee"],
    location: {
      city: "Hanoi",
      country: "Vietnam"
    },
    age: 28,
    gender: "male",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActive: new Date()
  },
  {
    _id: ObjectId(),
    username: "jane_smith",
    email: "jane@grownet.com",
    password: "$2b$10$XQlL8VK3MqnQQQ1LxQqQQu",
    fullName: "Jane Smith",
    bio: "Designer | Artist | Nature lover",
    avatar: "https://i.pravatar.cc/150?img=5",
    interests: ["design", "art", "nature", "yoga"],
    location: {
      city: "Ho Chi Minh",
      country: "Vietnam"
    },
    age: 25,
    gender: "female",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActive: new Date()
  },
  {
    _id: ObjectId(),
    username: "mike_wilson",
    email: "mike@grownet.com",
    password: "$2b$10$XQlL8VK3MqnQQQ1LxQqQQu",
    fullName: "Mike Wilson",
    bio: "Entrepreneur | Fitness enthusiast",
    avatar: "https://i.pravatar.cc/150?img=12",
    interests: ["business", "fitness", "startup", "networking"],
    location: {
      city: "Da Nang",
      country: "Vietnam"
    },
    age: 32,
    gender: "male",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActive: new Date()
  }
];

db.users.insertMany(users);
print(`Inserted ${users.length} users`);

// Get user IDs for references
const john = db.users.findOne({ email: "john@grownet.com" });
const jane = db.users.findOne({ email: "jane@grownet.com" });
const mike = db.users.findOne({ email: "mike@grownet.com" });

// Sample Posts
print('Creating sample posts...');

const posts = [
  {
    _id: ObjectId(),
    authorId: john._id,
    content: "Just deployed my first app on GrowNet! Excited to connect with everyone! 🚀",
    images: [],
    likes: [jane._id, mike._id],
    comments: [
      {
        userId: jane._id,
        content: "Congratulations! 🎉",
        createdAt: new Date()
      }
    ],
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000)
  },
  {
    _id: ObjectId(),
    authorId: jane._id,
    content: "Beautiful sunset in Da Nang today! 🌅",
    images: ["https://picsum.photos/800/600?random=1"],
    likes: [john._id, mike._id],
    comments: [],
    createdAt: new Date(Date.now() - 43200000), // 12 hours ago
    updatedAt: new Date(Date.now() - 43200000)
  },
  {
    _id: ObjectId(),
    authorId: mike._id,
    content: "Looking for co-founders for my new startup. Anyone interested in AI/ML? 🤖",
    images: [],
    likes: [john._id],
    comments: [
      {
        userId: john._id,
        content: "I'm interested! Let's talk.",
        createdAt: new Date()
      }
    ],
    createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    updatedAt: new Date(Date.now() - 7200000)
  }
];

db.posts.insertMany(posts);
print(`Inserted ${posts.length} posts`);

// Sample Connections (friendships)
print('Creating sample connections...');

const connections = [
  {
    _id: ObjectId(),
    userId1: john._id,
    userId2: jane._id,
    status: "accepted",
    createdAt: new Date(Date.now() - 2592000000), // 30 days ago
    updatedAt: new Date(Date.now() - 2592000000)
  },
  {
    _id: ObjectId(),
    userId1: john._id,
    userId2: mike._id,
    status: "accepted",
    createdAt: new Date(Date.now() - 1296000000), // 15 days ago
    updatedAt: new Date(Date.now() - 1296000000)
  },
  {
    _id: ObjectId(),
    userId1: jane._id,
    userId2: mike._id,
    status: "pending",
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000)
  }
];

db.connections.insertMany(connections);
print(`Inserted ${connections.length} connections`);

// Sample Chat
print('Creating sample chats...');

const chat = {
  _id: ObjectId(),
  type: "private",
  participants: [john._id, jane._id],
  lastMessage: {
    content: "See you tomorrow!",
    senderId: jane._id,
    timestamp: new Date()
  },
  createdAt: new Date(Date.now() - 2592000000),
  updatedAt: new Date()
};

db.chats.insertOne(chat);
print('Inserted 1 chat');

// Sample Messages
print('Creating sample messages...');

const messages = [
  {
    _id: ObjectId(),
    chatId: chat._id,
    senderId: john._id,
    content: "Hey Jane! How are you?",
    type: "text",
    readBy: [john._id, jane._id],
    createdAt: new Date(Date.now() - 3600000) // 1 hour ago
  },
  {
    _id: ObjectId(),
    chatId: chat._id,
    senderId: jane._id,
    content: "Hi John! I'm good, thanks! How about you?",
    type: "text",
    readBy: [john._id, jane._id],
    createdAt: new Date(Date.now() - 3000000) // 50 mins ago
  },
  {
    _id: ObjectId(),
    chatId: chat._id,
    senderId: john._id,
    content: "Great! Want to grab coffee tomorrow?",
    type: "text",
    readBy: [john._id, jane._id],
    createdAt: new Date(Date.now() - 1800000) // 30 mins ago
  },
  {
    _id: ObjectId(),
    chatId: chat._id,
    senderId: jane._id,
    content: "Sure! See you tomorrow!",
    type: "text",
    readBy: [john._id, jane._id],
    createdAt: new Date(Date.now() - 60000) // 1 min ago
  }
];

db.messages.insertMany(messages);
print(`Inserted ${messages.length} messages`);

// Sample Notifications
print('Creating sample notifications...');

const notifications = [
  {
    _id: ObjectId(),
    userId: john._id,
    type: "like",
    message: "Jane Smith liked your post",
    relatedId: posts[0]._id,
    read: false,
    createdAt: new Date(Date.now() - 3600000)
  },
  {
    _id: ObjectId(),
    userId: mike._id,
    type: "comment",
    message: "John Doe commented on your post",
    relatedId: posts[2]._id,
    read: false,
    createdAt: new Date(Date.now() - 1800000)
  },
  {
    _id: ObjectId(),
    userId: jane._id,
    type: "connection",
    message: "Mike Wilson sent you a friend request",
    relatedId: connections[2]._id,
    read: false,
    createdAt: new Date(Date.now() - 86400000)
  }
];

db.notifications.insertMany(notifications);
print(`Inserted ${notifications.length} notifications`);

// ============================================
// 4. VERIFY DATA
// ============================================

print('\n========================================');
print('Database initialization complete!');
print('========================================\n');

print('Collections created:');
db.getCollectionNames().forEach(function(col) {
  const count = db[col].countDocuments();
  print(`  - ${col}: ${count} documents`);
});

print('\n========================================');
print('Sample Queries:');
print('========================================');
print('\n1. Get all users:');
print('   db.users.find()');
print('\n2. Get posts with author info:');
print('   db.posts.aggregate([{$lookup:{from:"users",localField:"authorId",foreignField:"_id",as:"author"}}])');
print('\n3. Get user\'s friends:');
print('   db.connections.find({$or:[{userId1:ObjectId("...")},{userId2:ObjectId("...")}],status:"accepted"})');
print('\n4. Get chat messages:');
print('   db.messages.find({chatId:ObjectId("...")}).sort({createdAt:1})');
print('\n========================================\n');
