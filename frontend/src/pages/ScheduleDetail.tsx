import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ScheduleDetail.css';

type TabKey = 'confirmed' | 'pending' | 'history';

interface Appointment {
  id: string;
  partner: {
    name: string;
    initials: string;
    role: 'mentor' | 'mentee';
    avatar?: string;
    color: string;
  };
  time: string;
  date: string;
  note: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
}

const sampleAppointments: Appointment[] = [
  {
    id: '1',
    partner: {
      name: 'Nguyễn Văn A',
      initials: 'NA',
      role: 'mentor',
      color: '#6a1b9a'
    },
    time: '09:00 - 10:00',
    date: 'Thứ Năm, 12/12/2025',
    note: 'Thảo luận mục tiêu học kỳ và kế hoạch theo tuần.',
    status: 'confirmed'
  },
  {
    id: '2',
    partner: {
      name: 'Trần Thị B',
      initials: 'TB',
      role: 'mentee',
      color: '#1e88e5'
    },
    time: '14:00 - 15:00',
    date: 'Thứ Sáu, 13/12/2025',
    note: 'Review code module X, chuẩn bị câu hỏi cho buổi sau.',
    status: 'confirmed'
  },
  {
    id: '3',
    partner: {
      name: 'Lê Văn C',
      initials: 'LC',
      role: 'mentor',
      color: '#43a047'
    },
    time: '10:30 - 11:30',
    date: 'Thứ Hai, 16/12/2025',
    note: 'Hướng dẫn setup dự án mới.',
    status: 'confirmed'
  }
];

export default function ScheduleDetail() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabKey>('confirmed');
    const [appointments] = useState<Appointment[]>(sampleAppointments);

    const getStatusBadge = (status: string) => {
        const badges = {
            confirmed: { label: 'Xác nhận', className: 'badge-confirmed' },
            pending: { label: 'Đang chờ', className: 'badge-pending' },
            completed: { label: 'Hoàn thành', className: 'badge-completed' },
            cancelled: { label: 'Đã hủy', className: 'badge-cancelled' }
        };
        return badges[status as keyof typeof badges] || badges.confirmed;
    };

    return (
        <div className="schedule-detail-page">
            <div className="schedule-detail-container">
                <div className="page-header">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                    </button>
                    <div>
                        <h1 className="page-title">Quản lý Lịch Trình</h1>
                        <p className="page-subtitle">Xem và quản lý các cuộc hẹn của bạn</p>
                    </div>
                </div>

                <div className="tabs-section">
                    <div className="tab-buttons">
                        <button 
                            className={`tab-btn ${activeTab === 'confirmed' ? 'active' : ''}`}
                            onClick={() => setActiveTab('confirmed')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                            <span>Đã xác nhận</span>
                            <span className="tab-count">{appointments.filter(a => a.status === 'confirmed').length}</span>
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                            onClick={() => setActiveTab('pending')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            <span>Đang chờ</span>
                            <span className="tab-count">0</span>
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                <polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                            <span>Lịch sử</span>
                            <span className="tab-count">0</span>
                        </button>
                    </div>
                </div>

                <div className="appointments-section">
                    {activeTab === 'confirmed' && (
                        <div className="appointments-list">
                            {appointments.filter(a => a.status === 'confirmed').map(appointment => (
                                <div key={appointment.id} className="appointment-card">
                                    <div className="card-left">
                                        <div 
                                            className="partner-avatar" 
                                            style={{ backgroundColor: appointment.partner.color }}
                                        >
                                            {appointment.partner.initials}
                                        </div>
                                        <div className="partner-info">
                                            <h3 className="partner-name">{appointment.partner.name}</h3>
                                            <span className={`role-badge ${appointment.partner.role}`}>
                                                {appointment.partner.role === 'mentor' ? 'Mentor' : 'Mentee'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="card-middle">
                                        <div className="time-info">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"/>
                                                <polyline points="12 6 12 12 16 14"/>
                                            </svg>
                                            <div>
                                                <div className="time-label">{appointment.time}</div>
                                                <div className="date-label">{appointment.date}</div>
                                            </div>
                                        </div>
                                        {appointment.note && (
                                            <div className="note-section">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                                    <polyline points="14 2 14 8 20 8"/>
                                                    <line x1="16" y1="13" x2="8" y2="13"/>
                                                    <line x1="16" y1="17" x2="8" y2="17"/>
                                                    <polyline points="10 9 9 9 8 9"/>
                                                </svg>
                                                <span className="note-text">{appointment.note}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="card-right">
                                        <span className={`status-badge ${getStatusBadge(appointment.status).className}`}>
                                            {getStatusBadge(appointment.status).label}
                                        </span>
                                        <div className="action-buttons">
                                            <button className="btn-icon" title="Xem chi tiết">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                    <circle cx="12" cy="12" r="3"/>
                                                </svg>
                                            </button>
                                            <button className="btn-icon" title="Nhắn tin">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                                </svg>
                                            </button>
                                            <button className="btn-icon danger" title="Hủy">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="10"/>
                                                    <line x1="15" y1="9" x2="9" y2="15"/>
                                                    <line x1="9" y1="9" x2="15" y2="15"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'pending' && (
                        <div className="empty-state">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            <h3>Chưa có lịch hẹn đang chờ</h3>
                            <p>Các cuộc hẹn chờ xác nhận sẽ hiển thị ở đây</p>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="empty-state">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                <polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                            <h3>Chưa có lịch sử</h3>
                            <p>Lịch sử các cuộc hẹn đã hoàn thành sẽ hiển thị ở đây</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}