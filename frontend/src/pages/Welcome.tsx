import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Welcome.css'

export default function Welcome() {
  const [step, setStep] = useState(1)
  const navigate = useNavigate()

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      navigate('/profile-setup')
    }
  }

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const content = [
    {
      title: 'Chào mừng đến với GrowNet!',
      description: 'Nền tảng kết nối mentor và mentee hàng đầu Việt Nam. Chúng tôi giúp bạn tìm kiếm và kết nối với những người phù hợp để cùng nhau phát triển sự nghiệp.',
      icon: '🚀',
      color: '#3b82f6'
    },
    {
      title: 'Kết nối với chuyên gia',
      description: 'Tìm kiếm mentor có kinh nghiệm trong lĩnh vực của bạn. Hoặc chia sẽ kiến thức của bạn với những người đang cần hướng dẫn.',
      icon: '🤝',
      color: '#8b5cf6'
    },
    {
      title: 'Phát triển vượt bậc',
      description: 'Xây dựng mối quan hệ bền vững, học hỏi từ kinh nghiệm thực tế và đạt được mục tiêu nghề nghiệp của bạn.',
      icon: '🌟',
      color: '#10b981'
    }
  ]

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <div className="logo-header">
          <img src="/GrowNet_icon.png" alt="GrowNet" />
        </div>

        <div className="welcome-icon" style={{ borderColor: content[step - 1].color }}>
          <span className="icon-emoji">{content[step - 1].icon}</span>
        </div>
        
        <h1 className="welcome-title" style={{ color: content[step - 1].color }}>
          {content[step - 1].title}
        </h1>
        <p className="welcome-description">{content[step - 1].description}</p>
        
        <div className="welcome-progress">
          <div className="progress-dots">
            {[1, 2, 3].map((dot) => (
              <span
                key={dot}
                className={`dot ${step >= dot ? 'active' : ''}`}
                style={{ backgroundColor: step >= dot ? content[step - 1].color : '#e2e8f0' }}
              />
            ))}
          </div>
        </div>
        
        <div className="welcome-buttons">
          <button 
            className="btn-previous" 
            onClick={handlePrevious}
            disabled={step === 1}
          >
            <span className="btn-icon">←</span>
            <span>Trước</span>
          </button>
          <button 
            className="btn-next" 
            onClick={handleNext}
            style={{ background: `linear-gradient(90deg, ${content[step - 1].color} 0%, ${content[step - 1].color}dd 100%)` }}
          >
            <span>{step === 3 ? 'Bắt đầu' : 'Tiếp theo'}</span>
            <span className="btn-icon">→</span>
          </button>
        </div>

        <button className="btn-skip" onClick={() => navigate('/profile-setup')}>
          Bỏ qua
        </button>
      </div>
    </div>
  )
}
