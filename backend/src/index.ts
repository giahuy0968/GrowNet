import express from 'express'
import path from 'path'
import fs from 'fs'
import cors from 'cors'
import mongoose from 'mongoose'
import { env } from './config/env'
import { connectMongo, disconnectMongo } from './db/mongoose'
import { connectMongoClient, disconnectMongoClient, pingUsers, Users, Profiles, Messages, Matches, Ratings, Swipes, Availability, Chats, Connections, Notifications, Posts } from './db/collections'
import usersRouter from './routes/users'
import messagesRouter from './routes/messages'
import authRouter from './routes/auth'

async function start() {
  await connectMongo(env.mongoUri)
  await connectMongoClient(env.mongoUri)
  await pingUsers()

  const app = express()

  // CORS Configuration - ĐÃ SỬA
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:4000',
    'http://localhost:5173', // Vite dev server
    'http://localhost:8080', // Vue dev server
  ]

  app.use(cors({
    origin: (origin, callback) => {  // ✅ ĐÚNG: origin, callback
      // Cho phép requests không có origin (như mobile apps, curl, postman)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      // Trong development, có thể log để debug
      if (env.nodeEnv === 'development') {
        console.log('CORS blocked origin:', origin)
      }

      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200,
    maxAge: 600 // Cache preflight 10 phút
  }))

  app.use(express.json())

  // Routes
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
  // DB check route
  app.get('/api/db-check', async (_req, res) => {
    try {
      // Mongoose connection state
      const mongooseState = mongoose.connection.readyState // 0=disconnected,1=connected,2=connecting,3=disconnecting

      // Native client ping via Users collection count
      let nativeOk = true
      let sampleUserId: string | null = null
      try {
        const one = await Users().findOne({}, { projection: { _id: 1 } })
        sampleUserId = one ? String(one._id) : null
      } catch (e) {
        nativeOk = false
      }

      res.json({
        ok: mongooseState === 1 && nativeOk,
        mongoose: { state: mongooseState },
        native: { ok: nativeOk, sampleUserId }
      })
    } catch (err) {
      res.status(500).json({ ok: false, error: (err as Error).message })
    }
  })

  // Debug: list sample documents from collections
  const debugCollections: Record<string, () => mongoose.mongo.Collection> = {
    users: Users as any,
    profiles: Profiles as any,
    messages: Messages as any,
    matches: Matches as any,
    ratings: Ratings as any,
    swipes: Swipes as any,
    availability: Availability as any,
    chats: Chats as any,
    connections: Connections as any,
    notifications: Notifications as any,
    posts: Posts as any,
  }

  app.get('/api/debug/:collection', async (req, res) => {
    const name = String(req.params.collection || '').toLowerCase()
    const getter = debugCollections[name]
    const limit = Number(req.query.limit ?? 5)
    if (!getter) {
      return res.status(400).json({ ok: false, error: 'unknown collection', allowed: Object.keys(debugCollections) })
    }
    try {
      const col: any = getter()
      const docs = await col.find({}).limit(Math.max(1, Math.min(limit, 50))).toArray()
      res.json({ ok: true, count: docs.length, docs })
    } catch (e) {
      res.status(500).json({ ok: false, error: (e as Error).message })
    }
  })
  app.use('/api/auth', authRouter)
  app.use('/api/users', usersRouter)
  app.use('/api/messages', messagesRouter)

  // Locales
  app.get('/api/locales/en', (req, res) => {
    const p = path.join(__dirname, '../../Home/locales/en.json')

    if (fs.existsSync(p)) {
      try {
        const content = fs.readFileSync(p, 'utf8')
        res.json(JSON.parse(content))
      } catch (error) {
        console.error('Error reading locale file:', error)
        res.status(500).json({ error: 'invalid locale JSON' })
      }
    } else {
      console.log('Locale file not found at:', p)
      res.status(404).json({ error: 'locale not found' })
    }
  })

  // Static files
  const staticPath = path.join(__dirname, '../../Home/public')
  console.log('Serving static files from:', staticPath)
  app.use(express.static(staticPath))

  // 404 Handler (thêm vào)
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' })
  })

  // Error Handler (thêm vào)
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err.message)
    res.status(500).json({
      error: 'Internal server error',
      ...(env.nodeEnv === 'development' && { details: err.message })
    })
  })

  const server = app.listen(env.port, () =>
    console.log(`Backend listening on http://localhost:${env.port}`)
  )

  // Enhanced Graceful shutdown
  const shutdown = async (signal?: string) => {
    console.log(`\n${signal || 'Manual'} shutdown initiated...`)

    // Đóng server HTTP
    server.close(() => {
      console.log('HTTP server closed')
    })

    // Timeout bắt buộc shutdown sau 10s
    const forceShutdown = setTimeout(() => {
      console.error('Forcing shutdown after timeout')
      process.exit(1)
    }, 10000)

    // Đóng MongoDB connection
    try {
      await disconnectMongo()
      await disconnectMongoClient()
      console.log('MongoDB connections closed')
    } catch (error) {
      console.error('Error closing MongoDB:', error)
    }

    // Clear timeout và thoát
    clearTimeout(forceShutdown)
    console.log('Graceful shutdown complete')
    process.exit(0)
  }

  // Signal handlers
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))

  // Global error handlers
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error)
    shutdown('uncaughtException')
  })

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
    shutdown('unhandledRejection')
  })
}

start().catch(err => {
  console.error('Startup failed:', err)
  process.exit(1)
})