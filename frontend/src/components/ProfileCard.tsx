

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/ProfileCard.css';

export default function ProfileCard({ userId = 'mentor-123', onSwipe }: { userId?: string, onSwipe?: (dir: 'left' | 'right') => void }) {
  const navigate = useNavigate();
  const profileType = 'mentor'; // Thay bằng logic thực tế (mentor/mentee)

  // Swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: () => onSwipe?.('left'),
    onSwipedRight: () => onSwipe?.('right'),

    trackMouse: true,
  });

  // Animation state
  const [swipeDir, setSwipeDir] = React.useState<null | 'left' | 'right'>(null);

  React.useEffect(() => {
    if (swipeDir) {
      setTimeout(() => setSwipeDir(null), 400);
    }
  }, [swipeDir]);

  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSwipeDir('right');
    onSwipe?.('right');
  };
  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSwipeDir('left');
    onSwipe?.('left');
  };

  const handleClick = () => {
    navigate(`/${profileType}-profile/${userId}`);
  };

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
            <h2>Nguyễn A</h2>
            <p className="profile-role">Frontend Developer • TP.HCM</p>

            <div className="profile-tags">
              <span className="tag">ReactJS</span>
              <span className="tag">TypeScript</span>
              <span className="tag">UI/UX</span>
            </div>

            <div className="profile-description">
              <h3>Mô tả tóm tắt</h3>
              <p>
                Chuyên gia Frontend 5 năm kinh nghiệm. Đã hoàn thành hơn 10 dự án lớn nhờ sử dụng React và NextJS, tập trung vào hiệu suất và trải nghiệm người dùng...
              </p>
            </div>
          </div>
        </div>

        <div className="profile-actions" onClick={(e) => e.stopPropagation()}>
          <button className="btn-action btn-cancel" onClick={handleCancel}>✕</button>
          <button className="btn-action btn-accept" onClick={handleAccept}>✓</button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
