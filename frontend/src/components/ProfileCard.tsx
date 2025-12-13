import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSwipeable } from 'react-swipeable'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import type { User } from '../services/auth.service'
import '../styles/ProfileCard.css'

interface ProfileCardProps {
  profile?: User;
  onSwipe?: (dir: 'left' | 'right', profile: User) => void;
  disabled?: boolean;
}

export default function ProfileCard({ profile, onSwipe, disabled }: ProfileCardProps) {
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const displayUser = profile || authUser

  if (!displayUser) {
    return (
      <div className="profile-card loading">
        <p>Không tìm thấy thông tin người dùng</p>
      </div>
    )
  }

  const location = [displayUser.location?.city, displayUser.location?.country]
    .filter(Boolean)
    .join(', ') || 'Chưa cập nhật'
  const interests = displayUser.interests && displayUser.interests.length > 0
    ? displayUser.interests
    : ['Chưa cập nhật']
  const summary = displayUser.bio || 'Thêm mô tả để mentee/mentor hiểu rõ hơn về bạn.'

  // Swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: () => !disabled && onSwipe?.('left', displayUser),
    onSwipedRight: () => !disabled && onSwipe?.('right', displayUser),

    trackMouse: true,
  })

  // Animation state
  const [swipeDir, setSwipeDir] = React.useState<null | 'left' | 'right'>(null)
  const [bgFailed, setBgFailed] = React.useState(false)

  React.useEffect(() => {
    if (swipeDir) {
      setTimeout(() => setSwipeDir(null), 400)
    }
  }, [swipeDir])

  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSwipeDir('right')
    if (!disabled) {
      onSwipe?.('right', displayUser)
    }
  }
  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSwipeDir('left')
    if (!disabled) {
      onSwipe?.('left', displayUser)
    }
  }

  const handleClick = () => {
    navigate(`/profiles/${displayUser._id}`)
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
          {bgFailed ? (
            <div className="profile-bg-fallback" aria-hidden="true" />
          ) : (
            <img
              src="/profile-bg.jpg"
              alt=""
              className="profile-bg"
              onError={() => setBgFailed(true)}
            />
          )}
        </div>

        <div className="profile-body">
          <div className="profile-info">
            <img src={displayUser.avatar || '/user_avt.png'} alt={displayUser.fullName} className="profile-avatar" />
            <h2>{displayUser.fullName || displayUser.username}</h2>
            <p className="profile-role">{displayUser.username} • {location}</p>

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
          <button className="btn-action btn-cancel" onClick={handleCancel} disabled={disabled}>✕</button>
          <button className="btn-action btn-accept" onClick={handleAccept} disabled={disabled}>✓</button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
