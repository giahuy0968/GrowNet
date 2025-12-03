import express from 'express'
import path from 'path'
import fs from 'fs'
import cors from 'cors'
import mongoose from 'mongoose'
import { env } from './config/env'
import { connectMongo, disconnectMongo } from './db/mongoose'
import usersRouter from './routes/users'
import messagesRouter from './routes/messages'
import authRouter from './routes/auth'

async function start() {
  await connectMongo(env.mongoUri)

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
      console.log('MongoDB connection closed')
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