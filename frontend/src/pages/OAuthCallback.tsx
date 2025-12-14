import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/Auth.css'

export default function OAuthCallback() {
  const location = useLocation()
  const navigate = useNavigate()
  const { completeSocialLogin } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(true)

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const provider = searchParams.get('provider') || 'mạng xã hội'

  useEffect(() => {
    const token = searchParams.get('token')
    const errorMessage = searchParams.get('error')

    if (errorMessage) {
      setError(errorMessage)
      setProcessing(false)
      return
    }

    if (!token) {
      setError('Không tìm thấy thông tin đăng nhập. Vui lòng thử lại.')
      setProcessing(false)
      return
    }

    const finalize = async () => {
      try {
        await completeSocialLogin(token)
        navigate('/dashboard', { replace: true })
      } catch (err: any) {
        setError(err?.message || 'Không thể hoàn tất đăng nhập. Vui lòng thử lại.')
        setProcessing(false)
      }
    }

    finalize()
  }, [completeSocialLogin, navigate, searchParams])

  return (
    <div className="auth-container">
      <div className="auth-card register-card" style={{ textAlign: 'center' }}>
        <h1 className="auth-title">Đang xử lý đăng nhập</h1>
        {processing && (
          <p>Vui lòng đợi GrowNet xác thực tài khoản {provider} của bạn...</p>
        )}
        {!processing && error && (
          <>
            <div className="error-message" style={{ marginBottom: 16 }}>
              {error}
            </div>
            <button type="button" className="btn-auth" onClick={() => navigate('/login')}>
              Quay lại đăng nhập
            </button>
          </>
        )}
      </div>
    </div>
  )
}
