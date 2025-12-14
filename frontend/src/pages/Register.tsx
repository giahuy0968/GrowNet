import React, { useEffect, useState } from 'react'
import { API_URL } from '../config/api'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import authService, { SocialLoginProvider } from '../services/auth.service'
import '../styles/Auth.css'

const SOCIAL_PROVIDERS: SocialLoginProvider[] = ['google', 'linkedin', 'facebook']

const SOCIAL_PROVIDER_META: Record<SocialLoginProvider, { label: string; icon: string; className: string }> = {
  google: { label: 'Google', icon: '/google-icon.svg', className: 'btn-google' },
  linkedin: { label: 'LinkedIn', icon: '/linkedin-icon.svg', className: 'btn-linkedin' },
  facebook: { label: 'Facebook', icon: '/facebook-icon.svg', className: 'btn-facebook' }
}

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    captcha: ''
  })
  const [captchaSvg, setCaptchaSvg] = useState<string | null>(null)
  const [captchaRefreshKey, setCaptchaRefreshKey] = useState<number>(Date.now())
  const [captchaError, setCaptchaError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [availableProviders, setAvailableProviders] = useState<SocialLoginProvider[]>([])
  const [providerLoading, setProviderLoading] = useState(true)

  const handleSocialLogin = (provider: SocialLoginProvider) => {
    const redirectUrl = `${window.location.origin}/oauth/callback`
    const authUrl = `${API_URL}/auth/oauth/${provider}?redirect=${encodeURIComponent(redirectUrl)}`
    window.location.href = authUrl
  }

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const providers = await authService.getEnabledProviders()
        const filtered = providers.filter((provider): provider is SocialLoginProvider =>
          SOCIAL_PROVIDERS.includes(provider)
        )
        setAvailableProviders(filtered)
      } catch {
        setAvailableProviders(SOCIAL_PROVIDERS)
      } finally {
        setProviderLoading(false)
      }
    }

    fetchProviders()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError(null)
    setCaptchaError(null)
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
    // safety timeout: if request doesn't finish in this time, unblock UI
    const safetyTimeout = setTimeout(() => {
      setLoading(false)
      setCaptchaError('Sai mã xác minh.')
      setCaptchaRefreshKey(Date.now())
    }, 1000)
    setError(null)

    try {
      setCaptchaError(null)
      // include captcha in register payload
      await register(formData.username, formData.email, formData.password, formData.fullName, formData.captcha)
      navigate('/welcome')
    } catch (err: any) {
      const status = err?.status
      const msg = err?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
      // If backend reports captcha error (400) or message contains 'captcha', show inline captcha message and refresh captcha
      if (status === 400 && /captcha/i.test(msg)) {
        setCaptchaError(msg)
        // refresh captcha image immediately
        await fetchCaptcha()
        // clear input so user can type new captcha
        setFormData(prev => ({ ...prev, captcha: '' }))
      } else if (typeof msg === 'string' && /captcha/i.test(msg)) {
        setCaptchaError(msg)
        await fetchCaptcha()
        setFormData(prev => ({ ...prev, captcha: '' }))
      } else {
        setError(msg)
      }
    } finally {
      clearTimeout(safetyTimeout)
      setLoading(false)
    }
  }

  const fetchCaptcha = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/captcha?ts=${Date.now()}`, {
        method: 'GET',
        credentials: 'include'
      })
      const svg = await res.text()
      setCaptchaSvg(svg)
    } catch (err) {
      // ignore
    }
  }

  React.useEffect(() => {
    fetchCaptcha()
  }, [captchaRefreshKey])

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

          <div className="form-group captcha-group">
            <label>Xác minh CAPTCHA</label>
            <div className="captcha-wrapper">
              <div className="captcha-display">
                {captchaSvg ? (
                  <div dangerouslySetInnerHTML={{ __html: captchaSvg }} />
                ) : (
                  <span>Loading...</span>
                )}
              </div>
              <button 
                type="button" 
                className="btn-refresh-captcha"
                onClick={() => setCaptchaRefreshKey(Date.now())}
                title="Làm mới mã captcha"
              >
                ↻
              </button>
              <input
                type="text"
                name="captcha"
                placeholder="Nhập mã"
                value={formData.captcha}
                onChange={handleChange}
                required
              />
            </div>
            {captchaError && (
              <div style={{ color: '#c33', marginTop: 8, fontSize: '0.9rem' }} role="alert">
                {captchaError}
              </div>
            )}
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>

          <div className="divider">
            <span>hoặc</span>
          </div>

          {availableProviders.length > 0 ? (
            <div className="social-buttons">
              {availableProviders.map(provider => {
                const meta = SOCIAL_PROVIDER_META[provider]
                return (
                  <button
                    type="button"
                    key={provider}
                    className={`btn-social ${meta.className}`}
                    onClick={() => handleSocialLogin(provider)}
                  >
                    <img src={meta.icon} alt={meta.label} />
                    {meta.label}
                  </button>
                )
              })}
            </div>
          ) : (
            !providerLoading && (
              <p className="auth-footer" style={{ marginTop: 12 }}>
                Đăng ký bằng mạng xã hội đang được cấu hình. Vui lòng thử lại sau.
              </p>
            )
          )}
          <p className="auth-footer">
            Bạn đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
