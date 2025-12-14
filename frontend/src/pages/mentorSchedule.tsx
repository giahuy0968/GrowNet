import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MentorSchedule.css';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface ScheduleEvent {
  id: number;
  mentor: string;
  avatar: string;
  subject: string;
  time: string;
  location: string;
  status: 'confirmed' | 'pending' | 'warning';
}

const MentorSchedule: React.FC = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 9)); // October 2025
  const [selectedDate, setSelectedDate] = useState(22);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { time: '07:30 - 8:30', available: true },
    { time: '10:00 - 11:30', available: false },
    { time: '14:00 - 15:30', available: false },
    { time: '17:30 - 19:00', available: true },
    { time: '20:00 - 21:30', available: false },
  ]);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

  const [scheduleEvents] = useState<ScheduleEvent[]>([
    {
      id: 1,
      mentor: 'Vũ Anh',
      avatar: 'VA',
      subject: 'Sinh viên năm cuối, Chuyên ngành Marketing',
      time: '10:00 - 11:30',
      location: 'Online',
      status: 'confirmed',
    },
    {
      id: 2,
      mentor: 'Minh Anh',
      avatar: 'MA',
      subject: 'Sinh viên năm cuối, Chuyên ngành Truyền thông',
      time: '14:00 - 15:30',
      location: 'Highland Coffee',
      status: 'confirmed',
    },
    {
      id: 3,
      mentor: 'Gia Huy',
      avatar: 'GH',
      subject: 'Sinh viên năm nhất, Chuyên ngành AI nâng cao',
      time: '20:00 - 21:30',
      location: 'Online',
      status: 'warning',
    },
  ]);

  // Generate calendar days
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

  const calendarDays: (number | null)[] = Array(firstDay)
    .fill(null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(day);
  };

  const handleAddTimeSlot = () => {
    console.log('Add time slot for date:', selectedDate);
  };

  const handleToggleNotification = () => {
    setIsNotificationEnabled(!isNotificationEnabled);
  };

  const handleClose = () => {
    navigate(-1);
  };

  const getAvatarColor = (index: number) => {
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
    return colors[index % colors.length];
  };

  return (
    <div className="mentor-schedule-container">
      <div className="schedule-modal">
        {/* Header */}
        <div className="schedule-header">
          <h2>Quản lý lịch Mentor</h2>
          <button className="close-btn" onClick={handleClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="schedule-content">
          {/* Left: Calendar */}
          <div className="left-section">
            <div className="calendar-section">
              <div className="calendar-header">
                <button onClick={handlePrevMonth} className="nav-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <span className="month-title">
                  Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}
                </span>
                <button onClick={handleNextMonth} className="nav-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>

              <div className="weekdays">
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                  <div key={day} className="weekday">
                    {day}
                  </div>
                ))}
              </div>

              <div className="calendar-days">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`calendar-day ${day === selectedDate ? 'selected' : ''} ${
                      day === null ? 'empty' : ''
                    } ${day === 22 || day === 23 || day === 24 ? 'has-event' : ''}`}
                    onClick={() => day && handleDateClick(day)}
                  >
                    {day && (
                      <>
                        <span className="day-number">{day}</span>
                        {(day === 22 || day === 23 || day === 24) && (
                          <div className="day-indicators">
                            {day === 22 && (
                              <>
                                <span className="indicator green"></span>
                                <span className="indicator green"></span>
                              </>
                            )}
                            {day === 23 && <span className="indicator green"></span>}
                            {day === 24 && (
                              <>
                                <span className="indicator green"></span>
                                <span className="indicator orange"></span>
                              </>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Time slots */}
            <div className="time-slots-section">
              <div className="section-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <h3>Khung giờ ngày {selectedDate}/10</h3>
              </div>

              <div className="time-slots">
                {timeSlots.map((slot, idx) => (
                  <button
                    key={idx}
                    className={`time-slot ${slot.available ? 'available' : 'unavailable'}`}
                    onClick={() => slot.available && console.log('Select slot:', slot.time)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>{slot.time}</span>
                    {!slot.available && (
                      <svg className="lock-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              <button className="add-time-btn" onClick={handleAddTimeSlot}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Thêm khung giờ
              </button>
            </div>
          </div>

          {/* Right: Schedule Events */}
          <div className="right-section">
            <div className="section-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <h3>Lịch hẹn đã đặt</h3>
            </div>

            <div className="appointments-list">
              {scheduleEvents.map((event, idx) => (
                <div key={event.id} className="appointment-card">
                  <div className="appointment-header">
                    <div className="mentor-info">
                      <div
                        className="mentor-avatar"
                        style={{ backgroundColor: getAvatarColor(idx) }}
                      >
                        {event.avatar}
                      </div>
                      <div className="mentor-details">
                        <h4>{event.mentor}</h4>
                        <p>{event.subject}</p>
                      </div>
                    </div>
                    <div className={`status-badge ${event.status}`}>
                      {event.status === 'confirmed' && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                      {event.status === 'pending' && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                      )}
                      {event.status === 'warning' && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                          <line x1="12" y1="9" x2="12" y2="13"></line>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                      )}
                      <span>
                        {event.status === 'confirmed' && 'Đã xác nhận'}
                        {event.status === 'pending' && 'Chờ xác nhận'}
                        {event.status === 'warning' && 'Cần xác nhận'}
                      </span>
                    </div>
                  </div>

                  <div className="appointment-details">
                    <div className="detail-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span>{event.time}</span>
                    </div>
                    <div className="detail-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="appointment-actions">
                    <button className="action-btn view">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      Chi tiết
                    </button>
                    <button className="action-btn message">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      Nhắn tin
                    </button>
                    <button className="action-btn cancel">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      Hủy
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Settings */}
            <div className="settings-section">
              <div className="setting-item">
                <div className="setting-label">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <span>Tự động xác nhận lịch hẹn</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={isNotificationEnabled}
                    onChange={handleToggleNotification}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="course-info-card">
                <div className="course-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
                <div className="course-content">
                  <h4>Khóa học Marketing cơ bản</h4>
                  <p>Khóa học giới thiệu các nguyên lý cơ bản của Marketing hiện đại, từ chiến lược tổng thể đến thực hiện các chiến dịch cụ thể.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorSchedule;
