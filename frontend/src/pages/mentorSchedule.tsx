import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { meetingService, type Meeting } from '../services';
import { useAuth } from '../contexts';
import '../styles/MentorSchedule.css';

type AppointmentStatus = 'confirmed' | 'pending' | 'warning';

const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const formatMonthLabel = (date: Date) => `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;

const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

const formatDateLabel = (date: Date) => new Intl.DateTimeFormat('vi-VN', {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
}).format(date);

const formatTimeRange = (start: Date, end: Date) => new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}).format(start) + ' - ' + new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}).format(end);

const categorizeStatus = (meeting: Meeting): AppointmentStatus => {
  const now = Date.now();
  const start = new Date(meeting.startTime).getTime();
  const hasPending = meeting.attendees?.some(att => {
    if (!att.responseStatus) {
      return false;
    }
    const normalized = att.responseStatus.toLowerCase();
    return normalized === 'needsaction' || normalized === 'tentative';
  });

  if (hasPending) {
    return 'pending';
  }
  if (start < now) {
    return 'warning';
  }
  return 'confirmed';
};

const getAvatarColor = (index: number) => {
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
  return colors[index % colors.length];
};

const MentorSchedule: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59, 999);

        const { meetings: data } = await meetingService.listMine({
          start: start.toISOString(),
          end: end.toISOString()
        });

        if (!active) {
          return;
        }

        setMeetings(data);
        setError(null);
      } catch (err) {
        if (active) {
          setError('Không thể tải lịch hẹn. Vui lòng thử lại.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchMeetings();

    return () => {
      active = false;
    };
  }, [currentMonth, reloadKey]);

  useEffect(() => {
    const sameMonth =
      selectedDate.getFullYear() === currentMonth.getFullYear() &&
      selectedDate.getMonth() === currentMonth.getMonth();

    if (!sameMonth) {
      setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1));
    }
  }, [currentMonth, selectedDate]);

  const meetingsByDate = useMemo(() => {
    return meetings.reduce<Record<string, Meeting[]>>((acc, meeting) => {
      const key = formatDateKey(new Date(meeting.startTime));
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(meeting);
      return acc;
    }, {});
  }, [meetings]);

  const selectedMeetings = useMemo(() => {
    const key = formatDateKey(selectedDate);
    const items = meetingsByDate[key] || [];
    return [...items].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [meetingsByDate, selectedDate]);

  const upcomingMeetings = useMemo(() => {
    return [...meetings].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [meetings]);

  const firstDay = useMemo(() => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1), [currentMonth]);
  const daysInMonth = useMemo(() => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate(), [currentMonth]);
  const leadingEmptyCells = useMemo(() => firstDay.getDay(), [firstDay]);
  const calendarDays = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
  };

  const handleToggleNotification = () => {
    setIsNotificationEnabled(prev => !prev);
  };

  const handleClose = () => {
    navigate(-1);
  };

  const handleRetry = () => setReloadKey(prev => prev + 1);

  const handleViewMeeting = (meeting: Meeting) => {
    if (meeting.videoLink) {
      window.open(meeting.videoLink, '_blank', 'noopener');
      return;
    }
    if (meeting.chatId) {
      navigate(`/chat/${meeting.chatId}`, { state: { chatId: meeting.chatId } });
    }
  };

  const handleMessage = (meeting: Meeting) => {
    if (meeting.chatId) {
      navigate(`/chat/${meeting.chatId}`, { state: { chatId: meeting.chatId } });
    }
  };

  const handleCancelMeeting = async (meetingId: string) => {
    if (cancellingId) {
      return;
    }
    try {
      setCancellingId(meetingId);
      await meetingService.cancel(meetingId);
      setMeetings(prev => prev.filter(meeting => meeting._id !== meetingId));
    } catch (err) {
      setError('Không thể hủy cuộc hẹn. Vui lòng thử lại.');
    } finally {
      setCancellingId(null);
    }
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
                <span className="month-title">{formatMonthLabel(currentMonth)}</span>
                <button onClick={handleNextMonth} className="nav-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>

              <div className="weekdays">
                {WEEKDAY_LABELS.map(day => (
                  <div key={day} className="weekday">
                    {day}
                  </div>
                ))}
              </div>

              <div className="calendar-days">
                {Array.from({ length: leadingEmptyCells }).map((_, index) => (
                  <div key={`empty-${index}`} className="calendar-day empty" />
                ))}

                {calendarDays.map(day => {
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  const key = formatDateKey(date);
                  const hasEvents = Boolean(meetingsByDate[key]?.length);
                  const isSelected = selectedDate.getDate() === day &&
                    selectedDate.getMonth() === currentMonth.getMonth() &&
                    selectedDate.getFullYear() === currentMonth.getFullYear();

                  return (
                    <button
                      type="button"
                      key={day}
                      className={`calendar-day ${isSelected ? 'selected' : ''} ${hasEvents ? 'has-event' : ''}`}
                      onClick={() => handleDateClick(day)}
                    >
                      <span className="day-number">{day}</span>
                      {hasEvents && <span className="indicator green"></span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            <div className="time-slots-section">
              <div className="section-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <h3>Buổi hẹn ngày {selectedDate.getDate()}/{selectedDate.getMonth() + 1}</h3>
              </div>

              <div className="time-slots">
                {loading && (
                  <div className="empty-state">
                    <h3>Đang tải...</h3>
                  </div>
                )}

                {!loading && error && (
                  <div className="empty-state">
                    <h3>Không thể tải lịch</h3>
                    <button className="action-btn view" onClick={handleRetry}>Thử lại</button>
                  </div>
                )}

                {!loading && !error && selectedMeetings.length === 0 && (
                  <div className="empty-state">
                    <h3>Chưa có cuộc hẹn</h3>
                    <p>Bạn có thể tạo cuộc hẹn mới từ màn hình chat.</p>
                  </div>
                )}

                {!loading && !error && selectedMeetings.length > 0 && (
                  selectedMeetings.map(meeting => {
                    const start = new Date(meeting.startTime);
                    const end = new Date(meeting.endTime);
                    const isPast = end.getTime() < Date.now();
                    return (
                      <button
                        key={meeting._id}
                        className={`time-slot ${isPast ? 'unavailable' : 'available'}`}
                        onClick={() => handleViewMeeting(meeting)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>{formatTimeRange(start, end)}</span>
                        {isPast && (
                          <svg className="lock-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                          </svg>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
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
              {loading && (
                <div className="empty-state">
                  <h3>Đang tải lịch hẹn...</h3>
                </div>
              )}

              {!loading && error && (
                <div className="empty-state">
                  <h3>Không thể tải lịch hẹn</h3>
                  <p>{error}</p>
                  <button className="action-btn view" onClick={handleRetry}>Thử lại</button>
                </div>
              )}

              {!loading && !error && upcomingMeetings.length === 0 && (
                <div className="empty-state">
                  <h3>Chưa có cuộc hẹn nào</h3>
                  <p>Tạo cuộc hẹn mới từ màn hình chat để hiển thị tại đây.</p>
                </div>
              )}

              {!loading && !error && upcomingMeetings.length > 0 && (
                upcomingMeetings.map((meeting, idx) => {
                  const start = new Date(meeting.startTime);
                  const end = new Date(meeting.endTime);
                  const status = categorizeStatus(meeting);
                  const attendeeLabel = meeting.attendees?.map(att => att.email).join(', ') || 'Không có thông tin người tham dự';

                  return (
                    <div key={meeting._id} className="appointment-card">
                  <div className="appointment-header">
                    <div className="mentor-info">
                      <div
                        className="mentor-avatar"
                        style={{ backgroundColor: getAvatarColor(idx) }}
                      >
                            {meeting.title?.[0]?.toUpperCase() || 'G'}
                      </div>
                      <div className="mentor-details">
                            <h4>{meeting.title || 'Cuộc hẹn GrowNet'}</h4>
                            <p>{attendeeLabel}</p>
                      </div>
                    </div>
                        <div className={`status-badge ${status}`}>
                          {status === 'confirmed' && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                          {status === 'pending' && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                      )}
                          {status === 'warning' && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                          <line x1="12" y1="9" x2="12" y2="13"></line>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                      )}
                      <span>
                            {status === 'confirmed' && 'Đã xác nhận'}
                            {status === 'pending' && 'Chờ phản hồi'}
                            {status === 'warning' && 'Đã kết thúc'}
                      </span>
                    </div>
                  </div>

                  <div className="appointment-details">
                    <div className="detail-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                          <span>{formatTimeRange(start, end)}</span>
                    </div>
                    <div className="detail-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                          <span>{meeting.provider === 'custom' ? 'Địa điểm tùy chỉnh' : 'Online'}</span>
                    </div>
                  </div>

                  <div className="appointment-actions">
                        <button className="action-btn view" onClick={() => handleViewMeeting(meeting)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      Chi tiết
                    </button>
                        <button className="action-btn message" onClick={() => handleMessage(meeting)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      Nhắn tin
                    </button>
                        <button
                          className="action-btn cancel"
                          disabled={cancellingId === meeting._id}
                          onClick={() => handleCancelMeeting(meeting._id)}
                        >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      Hủy
                    </button>
                  </div>
                    </div>
                  );
                })
              )}
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
