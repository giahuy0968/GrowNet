import express, { Request, Response, NextFunction } from 'express'
import path from 'path'
import fs from 'fs'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import 'dotenv/config'
import UserModel from './User'

const app = express()
const port = process.env.PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development'
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/grownet_db'

// ----------------------------------------------------
// 1. KẾT NỐI MONGODB
// ----------------------------------------------------
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB kết nối thành công!'))
  .catch(err => {
    console.error('❌ LỖI KẾT NỐI MONGODB:', err.message)
    process.exit(1)
  })

// ----------------------------------------------------
// 2. CẤU HÌNH MIDDLEWARE
// ----------------------------------------------------
app.use(express.json()) // Cho phép ứng dụng đọc JSON body từ request

// ----------------------------------------------------
// 3. MIDDLEWARE XÁC THỰC (AUTHENTICATION MIDDLEWARE)
// ----------------------------------------------------

// KHẮC PHỤC LỖI: Định nghĩa interface tùy chỉnh cho Request
// Đây là nơi chúng ta thêm thuộc tính 'user' vào Request
interface AuthenticatedRequest extends Request {
  user?: { _id: string; email: string; role: 'mentor' | 'mentee' | 'admin' } 
}

/**
 * Middleware: Xác thực JWT từ header Authorization.
 */
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) {
    return res.status(401).json({ error: 'Truy cập bị từ chối: Không tìm thấy Token' })
  }

  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    if (err) {
      return res.status(403).json({ error: 'Token không hợp lệ hoặc đã hết hạn' })
    }
    // Gán thông tin user (đã giải mã từ JWT) vào request
    req.user = userPayload as { _id: string; email: string; role: 'mentor' | 'mentee' | 'admin' }
    next()
  })
}

/**
 * Middleware: Phân quyền (Authorization) dựa trên vai trò (Role).
 */
const authorizeRole = (requiredRole: 'mentor' | 'mentee' | 'admin') => {
  // KHẮC PHỤC LỖI: Đảm bảo middleware này nhận AuthenticatedRequest
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Bạn cần đăng nhập để thực hiện hành động này.' })
    }

    // Kiểm tra vai trò
    if (req.user.role !== requiredRole && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Bạn không có quyền truy cập tài nguyên này.' })
    }
    next()
  }
}

// ----------------------------------------------------
// 4. ENDPOINT ĐĂNG KÝ (REGISTER) - KHÔNG CẦN AUTHENTICATEDREQUEST
// ----------------------------------------------------
app.post('/api/register', async (req, res) => {
  const { email, password, role } = req.body

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ Email, Mật khẩu và Vai trò.' })
  }
  
  try {
    const existingUser = await UserModel.findOne({ email: email })
    if (existingUser) {
      return res.status(409).json({ error: 'Email đã tồn tại.' })
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)
    
    const newUser = new UserModel({
      email,
      passwordHash,
      role: (role === 'mentor' || role === 'mentee') ? role : 'mentee', 
    })

    await newUser.save()

    res.status(201).json({ message: 'Đăng ký thành công.', userId: newUser._id })

  } catch (error) {
    console.error('Lỗi đăng ký:', error)
    res.status(500).json({ error: 'Lỗi máy chủ trong quá trình đăng ký.' })
  }
})

// ----------------------------------------------------
// 5. ENDPOINT ĐĂNG NHẬP (LOGIN) - KHÔNG CẦN AUTHENTICATEDREQUEST
// ----------------------------------------------------
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Vui lòng cung cấp Email và Mật khẩu.' })
  }

  try {
    const user = await UserModel.findOne({ email: email })
    
    if (!user) {
      return res.status(401).json({ error: 'Sai Email hoặc Mật khẩu.' })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return res.status(401).json({ error: 'Sai Email hoặc Mật khẩu.' })
    }
    
    const tokenPayload = { 
      _id: user._id.toString(), // Chuyển ObjectId sang string
      email: user.email, 
      role: user.role 
    }

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' })

    res.json({ 
      token, 
      role: user.role, 
      message: 'Đăng nhập thành công',
      userId: user._id
    })
  } catch (error) {
    console.error('Lỗi đăng nhập:', error)
    res.status(500).json({ error: 'Lỗi máy chủ trong quá trình đăng nhập.' })
  }
})


// ----------------------------------------------------
// 6. ENDPOINT BẢO MẬT VÀ PHÂN QUYỀN (PROTECTED ENDPOINTS)
// ----------------------------------------------------

// KHẮC PHỤC LỖI: Sử dụng AuthenticatedRequest cho tham số req
app.get('/api/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userDetails = await UserModel.findById(req.user?._id).select('-passwordHash') 
    
    if (!userDetails) {
      return res.status(404).json({ error: 'Không tìm thấy hồ sơ người dùng.' })
    }

    res.json({
      message: 'Truy cập hồ sơ thành công.',
      user: req.user,
      userDetails: userDetails,
      data: 'Đây là dữ liệu hồ sơ cá nhân của bạn.'
    })
  } catch (error) {
    console.error('Lỗi truy cập hồ sơ:', error)
    res.status(500).json({ error: 'Lỗi máy chủ.' })
  }
})

// KHẮC PHỤC LỖI: Sử dụng AuthenticatedRequest cho tham số req
app.get('/api/mentor-data', authenticateToken, authorizeRole('mentor'), (req: AuthenticatedRequest, res) => {
  res.json({
    message: 'Truy cập dữ liệu Mentor thành công.',
    user: req.user,
    data: 'Danh sách các Mentee bạn đang hướng dẫn.'
  })
})

// KHẮC PHỤC LỖI: Sử dụng AuthenticatedRequest cho tham số req
app.get('/api/mentee-data', authenticateToken, authorizeRole('mentee'), (req: AuthenticatedRequest, res) => {
  res.json({
    message: 'Truy cập dữ liệu Mentee thành công.',
    user: req.user,
    data: 'Danh sách các Mentor bạn đang theo dõi.'
  })
})


// ----------------------------------------------------
// 7. CÁC ENDPOINT KHÁC
// ----------------------------------------------------
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.get('/api/locales/en', (req, res) => {
  const p = path.join(__dirname, '../../Home/locales/en.json')
  if (fs.existsSync(p)) {
    const raw = fs.readFileSync(p, 'utf8')
    try {
      const json = JSON.parse(raw)
      res.json(json)
    } catch (e) {
      res.status(500).json({ error: 'invalid locale JSON' })
    }
  } else {
    res.status(404).json({ error: 'locale not found' })
  }
})

app.use(express.static(path.join(__dirname, '../../Home/public')))

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
  console.log(`JWT Secret: ${JWT_SECRET}`)
})