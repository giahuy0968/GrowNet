import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/Auth.css'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value
    })
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      await login(formData.email, formData.password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        {/* Left Banner Section */}
        <div className="auth-banner">
          <div className="banner-content">
            <div className="banner-logo">
              <img src="/GrowNet_icon.png" alt="GrowNet" />
            </div>
            <h1 className="banner-title">Chào mừng đến với GrowNet</h1>
            <p className="banner-subtitle">
              Nền tảng kết nối mentor và mentee hàng đầu Việt Nam
            </p>
            <div className="banner-features">
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <p>Kết nối với mentor chuyên nghiệp</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <p>Học hỏi kinh nghiệm thực tế</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <p>Phát triển sự nghiệp vững chắc</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            <h2 className="form-title">Đăng nhập</h2>
            <p className="form-subtitle">Nhập thông tin để tiếp tục</p>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
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
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                  />
                  <span>Nhớ mật khẩu</span>
                </label>
                <Link to="/forgot-password" className="link-forgot">Quên mật khẩu?</Link>
              </div>

              <button type="submit" className="btn-auth" disabled={loading}>
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>

              <div className="divider">
                <span>hoặc</span>
              </div>

              <div className="social-buttons">
                <button type="button" className="btn-social btn-google">
                  <img src="/google-icon.svg" alt="Google" />
                  Google
                </button>
                <button type="button" className="btn-social btn-linkedin">
                  <img src="/linkedin-icon.svg" alt="LinkedIn" />
                  LinkedIn
                </button>
                <button type="button" className="btn-social btn-facebook">
                  <img src="/facebook-icon.svg" alt="Facebook" />
                  Facebook
                </button>
              </div>

              <p className="auth-footer">
                Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
