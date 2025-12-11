import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MentorSchedule.css';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface ScheduleEvent {
  mentor: string;
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
      mentor: 'Vũ Anh',
      subject: 'Sinh viên năm cuối, Chuyên ngành Marketing',
      time: '10:00 - 11:30',
      location: 'Online',
      status: 'confirmed',
    },
    {
      mentor: 'Minh Anh',
      subject: 'Sinh viên năm cuối, Chuyên ngành Truyền thông',
      time: '14:00 - 15:30',
      location: 'Highland Coffee',
      status: 'confirmed',
    },
    {
      mentor: 'Gia Huy',
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#D1FAE5';
      case 'pending':
        return '#FEF3C7';
      case 'warning':
        return '#FED7AA';
      default:
        return '#F3F4F6';
    }
  };

  return (
    <div className="mentor-schedule-container">
      <div className="schedule-modal">
        {/* Header with close button */}
        <div className="schedule-header">
          <h2>Lịch</h2>
          <button className="close-btn" onClick={handleClose}>&times;</button>
        </div>

        <div className="schedule-content">
          {/* Left: Calendar & Schedule Info */}
          <div className="left-section">
            {/* Calendar */}
            <div className="calendar-section">
              <div className="calendar-nav">
                <button onClick={handlePrevMonth}>&lt;</button>
                <span className="month-title">Tháng 10</span>
                <button onClick={handleNextMonth}>&gt;</button>
              </div>

              {/* Weekday headers */}
              <div className="weekdays">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="weekday">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="calendar-days">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`calendar-day ${day === selectedDate ? 'selected' : ''} ${
                      day === 22 || day === 23 || day === 24 ? 'has-event' : ''
                    }`}
                    onClick={() => day && handleDateClick(day)}
                  >
                    {day}
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
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule info section */}
            <div className="schedule-info">
              <h3>Thông tin lịch hẹn</h3>
              <div className="info-items">
                {scheduleEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className="info-item"
                    style={{ backgroundColor: getStatusColor(event.status) }}
                  >
                    <div className="info-mentor"><b>{event.mentor}</b></div>
                    <div className="info-subject"><b>{event.subject}</b></div>
                    <div className="info-time"><b>Thời gian:</b> {event.time}</div>
                    <div className="info-location"><b>Địa điểm:</b> {event.location}</div>
                    <div className="info-status"><b>Trạng thái:</b> {event.status === 'confirmed' ? 'Đã xác nhận' : event.status === 'pending' ? 'Chờ xác nhận' : 'Chưa xác nhận'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Time slots & settings */}
          <div className="right-section">
            {/* Time slots container */}
            <div className="time-slots-container">
              <h3>Cập nhật khung giờ</h3>

              <div className="time-slots">
                {timeSlots.map((slot, idx) => (
                  <button
                    key={idx}
                    className={`time-slot ${slot.available ? 'available' : 'unavailable'}`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>

              <button className="add-time-btn" onClick={handleAddTimeSlot}>
                Thêm khung giờ
              </button>
            </div>

            {/* Divider */}
            <div className="divider"></div>

            {/* Notification toggle */}
            <div className="notification-toggle">
              <label htmlFor="notification-switch">Xác nhận lịch hẹn</label>
              <input
                id="notification-switch"
                type="checkbox"
                className="toggle-switch"
                checked={isNotificationEnabled}
                onChange={handleToggleNotification}
              />
            </div>

            {/* Course info */}
            <div className="course-section">
              <h3>Khóa học Marketing cơ bản</h3>
              <p className="course-description">
                Khóa học giới thiệu các nguyên lý cơ bản của Marketing hiện đại, từ chiến lược tổng thể đến thực hiện các chiến dịch cụ thể.
              </p>
            </div>

            {/* Buttons */}
            <div className="action-buttons">
              <button className="contact-btn">Liên hệ</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorSchedule;
