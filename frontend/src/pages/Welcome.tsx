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

  const content = [
    {
      title: 'Chào mừng đến GrowNet!',
      description: 'GrowNet giúp bạn kết nối với những mentee/mentor vận phù hợp — cùng bạn phát triển kỹ năng, mở rộng tầm nhìn và đạt được mục tiêu nghề nghiệp.'
    },
    {
      title: 'Kết nối với Mentor/Mentee',
      description: 'Tìm kiếm và kết nối với những người có kinh nghiệm hoặc những người cần hướng dẫn trong lĩnh vực của bạn.'
    },
    {
      title: 'Phát triển cùng nhau',
      description: 'Xây dựng mối quan hệ, học hỏi và phát triển kỹ năng thông qua các buổi mentoring chất lượng.'
    }
  ]

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <div className="welcome-icon">
          <img src="/logo.svg" alt="GrowNet Logo" />
        </div>
        
        <h1 className="welcome-title">{content[step - 1].title}</h1>
        <p className="welcome-description">{content[step - 1].description}</p>
        
        <div className="welcome-progress">
          <span className="progress-text">{step} / 3</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>
        </div>
        
        <button className="btn-next" onClick={handleNext}>
          Tiếp theo
        </button>
      </div>
    </div>
  )
}
