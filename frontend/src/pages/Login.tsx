import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../styles/Auth.css'

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Handle login
    navigate('/dashboard')
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/GrowNet_icon.png" alt="GrowNet" />
        </div>
        
        <h1 className="auth-title">Đăng nhập</h1>
        <p className="auth-subtitle">Kết nối cùng mentor/mentee bạn tin tưởng</p>
        
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
              placeholder="•••••"
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

          <button type="submit" className="btn-auth">
            Đăng nhập
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
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
