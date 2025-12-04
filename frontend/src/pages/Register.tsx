import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../styles/Auth.css'

export default function Register() {
  const navigate = useNavigate()

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [captchaCode, setCaptchaCode] = useState('')
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCaptchaCode(result)
  }

  useEffect(() => {
    generateCaptcha()
  }, [])

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    captcha: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[^A-Za-z0-9]/.test(password)

    return minLength && hasUpper && hasLower && hasNumber && hasSpecial
  }

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!validateEmail(formData.email)) {
        setError('Email không hợp lệ!')
        return
      }

      if (!validatePassword(formData.password)) {
        setError('Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt!')
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Mật khẩu không khớp!')
        return
      }

      if (!formData.role) {
        setError('Vui lòng chọn vai trò!')
        return
      }

      if (formData.captcha !== captchaCode) {
        setError('CAPTCHA không khớp!')
        return
      }

      navigate('/welcome')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <h1 className="auth-title">Đăng ký</h1>

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
            {error && error.includes('Email') && <div className="error-message">{error}</div>}
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
            {error && error.includes('Mật khẩu phải') && <div className="error-message">{error}</div>}
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
            {error && error.includes('khớp') && <div className="error-message">{error}</div>}
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
            {error && error.includes('vai trò') && <div className="error-message">{error}</div>}
          </div>

          <div className="form-group captcha-group">
            <label>Xác minh CAPTCHA</label>
            <div className="captcha-wrapper">
              <div className="captcha-display">{captchaCode}</div>
              <button type="button" onClick={generateCaptcha} className="captcha-refresh">↻</button>
              <input
                type="text"
                name="captcha"
                placeholder="Nhập mã xác minh"
                value={formData.captcha}
                onChange={handleChange}
                required
              />
            </div>
            {error && error.includes('CAPTCHA') && <div className="error-message">{error}</div>}
          </div>

          <button type="submit" className="btn-auth" disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>

          <div className="divider">
            <span>hoặc</span>
          </div>

          <div className="social-buttons">
            <button type="button" className="btn-social btn-google" disabled={isLoading}>
              <img src="/google-icon.svg" alt="Google" />
              Google
            </button>
            <button type="button" className="btn-social btn-facebook" disabled={isLoading}>
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