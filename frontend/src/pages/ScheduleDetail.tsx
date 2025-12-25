import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { meetingService, type Meeting } from '../services';
import { useAuth } from '../contexts';
import '../styles/ScheduleDetail.css';

type TabKey = 'confirmed' | 'pending' | 'history';

type LocationState = {
    date?: string;
};

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

const getInitials = (value?: string) => {
    if (!value) {
        return 'GN';
    }
    const parts = value
        .replace(/[@._-]/g, ' ')
        .split(' ')
        .filter(Boolean);
    return parts.slice(0, 2).map(part => part[0]?.toUpperCase() ?? '').join('') || 'GN';
};

const categorizeMeeting = (meeting: Meeting): TabKey => {
    const now = Date.now();
    const end = new Date(meeting.endTime).getTime();
    if (end < now) {
        return 'history';
    }

    const hasPendingAttendee = meeting.attendees?.some(att => {
        if (!att.responseStatus) {
            return false;
        }
        const normalized = att.responseStatus.toLowerCase();
        return normalized === 'needsaction' || normalized === 'tentative';
    });

    return hasPendingAttendee ? 'pending' : 'confirmed';
};

export default function ScheduleDetail() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const locationState = location.state as LocationState | null;

    const [activeTab, setActiveTab] = useState<TabKey>('confirmed');
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        if (locationState?.date) {
            const parsed = new Date(locationState.date);
            if (!Number.isNaN(parsed.getTime())) {
                return parsed;
            }
        }
        return new Date();
    });
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    useEffect(() => {
        if (locationState?.date) {
            const parsed = new Date(locationState.date);
            if (!Number.isNaN(parsed.getTime())) {
                setSelectedDate(parsed);
            }
        }
    }, [locationState?.date]);

    useEffect(() => {
        let active = true;
        const fetchMeetings = async () => {
            try {
                setLoading(true);
                const start = new Date(selectedDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(selectedDate);
                end.setHours(23, 59, 59, 999);

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
                    setError('Không thể tải danh sách cuộc hẹn. Vui lòng thử lại.');
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
    }, [selectedDate, reloadKey]);

    const groupedMeetings = useMemo(() => {
        const initial: Record<TabKey, Meeting[]> = {
            confirmed: [],
            pending: [],
            history: []
        };

        meetings.forEach(meeting => {
            const category = categorizeMeeting(meeting);
            initial[category].push(meeting);
        });

        return initial;
    }, [meetings]);

    const currentMeetings = groupedMeetings[activeTab];

    const counts = {
        confirmed: groupedMeetings.confirmed.length,
        pending: groupedMeetings.pending.length,
        history: groupedMeetings.history.length
    };

    const primaryAttendee = (meeting: Meeting) => meeting.attendees?.[0]?.email || 'Cuộc hẹn GrowNet';

    const getStatusBadge = (status: TabKey) => {
        const badges = {
            confirmed: { label: 'Đã xác nhận', className: 'badge-confirmed' },
            pending: { label: 'Đang chờ', className: 'badge-pending' },
            history: { label: 'Lịch sử', className: 'badge-completed' }
        } as const;
        return badges[status];
    };

    const handleRetry = () => setReloadKey(prev => prev + 1);

    const handleOpenMeeting = (meeting: Meeting) => {
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
        <div className="schedule-detail-page">
            <div className="schedule-detail-container">
                <div className="page-header">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="page-title">Quản lý Lịch Trình</h1>
                        <p className="page-subtitle">Lịch ngày {formatDateLabel(selectedDate)}</p>
                    </div>
                </div>

                <div className="tabs-section">
                    <div className="tab-buttons">
                        <button
                            className={`tab-btn ${activeTab === 'confirmed' ? 'active' : ''}`}
                            onClick={() => setActiveTab('confirmed')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            <span>Đã xác nhận</span>
                            <span className="tab-count">{counts.confirmed}</span>
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                            onClick={() => setActiveTab('pending')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span>Đang chờ</span>
                            <span className="tab-count">{counts.pending}</span>
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            <span>Lịch sử</span>
                            <span className="tab-count">{counts.history}</span>
                        </button>
                    </div>
                </div>

                <div className="appointments-section">
                    {loading && (
                        <div className="empty-state">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <h3>Đang tải lịch hẹn...</h3>
                            <p>Vui lòng chờ trong giây lát.</p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="empty-state">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            <h3>Không thể tải lịch hẹn</h3>
                            <p>{error}</p>
                            <button type="button" className="action-btn view" onClick={handleRetry}>Thử lại</button>
                        </div>
                    )}

                    {!loading && !error && currentMeetings.length === 0 && (
                        <div className="empty-state">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            <h3>Không có cuộc hẹn</h3>
                            <p>Các cuộc hẹn thuộc nhóm này sẽ hiển thị tại đây.</p>
                        </div>
                    )}

                    {!loading && !error && currentMeetings.length > 0 && (
                        <div className="appointments-list">
                            {currentMeetings.map(meeting => {
                                const start = new Date(meeting.startTime);
                                const end = new Date(meeting.endTime);
                                const badge = getStatusBadge(categorizeMeeting(meeting));
                                const roleClass = meeting.organizerId === user?._id ? 'mentor' : 'mentee';

                                return (
                                    <div key={meeting._id} className="appointment-card">
                                        <div className="card-left">
                                            <div
                                                className="partner-avatar"
                                                style={{ backgroundColor: roleClass === 'mentor' ? '#6a1b9a' : '#1e88e5' }}
                                            >
                                                {getInitials(primaryAttendee(meeting))}
                                            </div>
                                            <div className="partner-info">
                                                <h3 className="partner-name">{meeting.title || 'Cuộc hẹn GrowNet'}</h3>
                                                <span className={`role-badge ${roleClass}`}>
                                                    {meeting.organizerId === user?._id ? 'Bạn là người tạo' : 'Bạn được mời'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="card-middle">
                                            <div className="time-info">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <polyline points="12 6 12 12 16 14" />
                                                </svg>
                                                <div>
                                                    <div className="time-label">{formatTimeRange(start, end)}</div>
                                                    <div className="date-label">{formatDateLabel(start)}</div>
                                                </div>
                                            </div>
                                            {meeting.description && (
                                                <div className="note-section">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                        <polyline points="14 2 14 8 20 8" />
                                                        <line x1="16" y1="13" x2="8" y2="13" />
                                                        <line x1="16" y1="17" x2="8" y2="17" />
                                                        <polyline points="10 9 9 9 8 9" />
                                                    </svg>
                                                    <span className="note-text">{meeting.description}</span>
                                                </div>
                                            )}
                                            <div className="note-section">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                                <span className="note-text">{primaryAttendee(meeting)}</span>
                                            </div>
                                        </div>

                                        <div className="card-right">
                                            <span className={`status-badge ${badge.className}`}>
                                                {badge.label}
                                            </span>
                                            <div className="action-buttons">
                                                <button className="btn-icon" title="Xem chi tiết" onClick={() => handleOpenMeeting(meeting)}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                </button>
                                                <button className="btn-icon" title="Nhắn tin" onClick={() => handleMessage(meeting)}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="btn-icon danger"
                                                    title="Hủy"
                                                    disabled={cancellingId === meeting._id}
                                                    onClick={() => handleCancelMeeting(meeting._id)}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <line x1="15" y1="9" x2="9" y2="15" />
                                                        <line x1="9" y1="9" x2="15" y2="15" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}