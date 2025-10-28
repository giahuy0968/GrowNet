// MongoDB Initialization Script
db = db.getSiblingDB('grownet');

// Create collections
db.createCollection('users');
db.createCollection('posts');
db.createCollection('chats');
db.createCollection('messages');
db.createCollection('connections');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.posts.createIndex({ "authorId": 1 });
db.posts.createIndex({ "createdAt": -1 });
db.messages.createIndex({ "chatId": 1, "createdAt": -1 });
db.connections.createIndex({ "userId1": 1, "userId2": 1 });

// Insert sample data (optional)
db.users.insertOne({
    username: "admin",
    email: "admin@grownet.com",
    password: "changethis", // Nên hash password trong production
    fullName: "Admin User",
    bio: "System Administrator",
    createdAt: new Date(),
    updatedAt: new Date()
});

print('Database initialized successfully!');
