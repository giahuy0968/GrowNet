import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/Auth.css'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    captcha: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp!')
      return
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!')
      return
    }

    if (!formData.username || !formData.fullName) {
      setError('Vui lòng điền đầy đủ thông tin!')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      await register(formData.username, formData.email, formData.password, formData.fullName)
      navigate('/welcome')
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <h1 className="auth-title">Đăng ký</h1>
        
        {error && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#fee', 
            color: '#c33', 
            borderRadius: '8px', 
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              placeholder="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
            />
          </div>

          <div className="form-group">
            <label>Họ và tên</label>
            <input
              type="text"
              name="fullName"
              placeholder="Nguyễn Văn A"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              name="password"
              placeholder="••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Xác nhận mật khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Vai trò đăng ký</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Chọn vai trò của bạn</option>
              <option value="mentor">Mentor (Hướng dẫn)</option>
              <option value="mentee">Mentee (Học hỏi)</option>
            </select>
          </div>

          <div className="form-group captcha-group">
            <label>Xác minh CAPTCHA</label>
            <div className="captcha-wrapper">
              <div className="captcha-display">6RkH2</div>
              <input
                type="text"
                name="captcha"
                placeholder="Nhập mã xác minh"
                value={formData.captcha}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>

          <div className="divider">
            <span>hoặc</span>
          </div>

          <div className="social-buttons">
            <button type="button" className="btn-social btn-google">
              <img src="/google-icon.svg" alt="Google" />
              Google
            </button>
            <button type="button" className="btn-social btn-facebook">
              <img src="/facebook-icon.svg" alt="Facebook" />
              Facebook
            </button>
          </div>

          <p className="auth-footer">
            Bạn đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
