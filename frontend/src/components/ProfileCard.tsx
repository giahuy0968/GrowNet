import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSwipeable } from 'react-swipeable'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import '../styles/ProfileCard.css'

interface ProfileCardProps {
  onSwipe?: (dir: 'left' | 'right') => void;
}

export default function ProfileCard({ onSwipe }: ProfileCardProps) {
  const navigate = useNavigate()
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="profile-card loading">
        <p>Đang tải thông tin tài khoản...</p>
      </div>
    )
  }

  const location = [user.location?.city, user.location?.country]
    .filter(Boolean)
    .join(', ') || 'Chưa cập nhật'
  const interests = user.interests && user.interests.length > 0
    ? user.interests
    : ['Chưa cập nhật']
  const summary = user.bio || 'Thêm mô tả để mentee/mentor hiểu rõ hơn về bạn.'

  // Swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: () => onSwipe?.('left'),
    onSwipedRight: () => onSwipe?.('right'),

    trackMouse: true,
  })

  // Animation state
  const [swipeDir, setSwipeDir] = React.useState<null | 'left' | 'right'>(null)

  React.useEffect(() => {
    if (swipeDir) {
      setTimeout(() => setSwipeDir(null), 400)
    }
  }, [swipeDir])

  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSwipeDir('right')
    onSwipe?.('right')
  }
  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSwipeDir('left')
    onSwipe?.('left')
  }

  const handleClick = () => {
    navigate(`/profile/${user._id}`)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="profile-card"
        onClick={handleClick}
        {...handlers}
        initial={{ x: 0, opacity: 1 }}
        animate={swipeDir === 'left' ? { x: -400, opacity: 0 } : swipeDir === 'right' ? { x: 400, opacity: 0 } : { x: 0, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="profile-header">
          <img src="/profile-bg.jpg" alt="Background" className="profile-bg" />
        </div>

        <div className="profile-body">
          <div className="profile-info">
            <img src={user.avatar || '/user_avt.png'} alt={user.fullName} className="profile-avatar" />
            <h2>{user.fullName || user.username}</h2>
            <p className="profile-role">{user.username} • {location}</p>

            <div className="profile-tags">
              {interests.map(tag => (
                <span className="tag" key={tag}>{tag}</span>
              ))}
            </div>

            <div className="profile-description">
              <h3>Mô tả tóm tắt</h3>
              <p>{summary}</p>
            </div>
          </div>
        </div>

        <div className="profile-actions" onClick={(e) => e.stopPropagation()}>
          <button className="btn-action btn-cancel" onClick={handleCancel}>✕</button>
          <button className="btn-action btn-accept" onClick={handleAccept}>✓</button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
