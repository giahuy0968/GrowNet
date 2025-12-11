import React, { useState } from 'react';
import '../styles/ScheduleDetail.css';

type TabKey = 'confirmed' | 'pending' | 'history';

export default function ScheduleDetail() {
    const [active] = useState<TabKey>('confirmed');

    return (
        <div className="schedule-page">
            <div className="schedule-container">
                <div className="schedule-header">
                    <button className="back-link" onClick={() => history.back()}>←</button>
                    <h1>Quản lý lịch trình cố vấn chi tiết</h1>
                </div>

                <div className="tabs-toolbar-wrapper">
                    <h2 style={{ marginTop: 0 }}>Danh sách lịch hẹn đã xác nhận</h2>
                </div>

                <div className="schedule-table-wrapper">
                    {active === 'confirmed' && (
                        <table className="schedule-table">
                            <thead>
                                <tr>
                                    <th>Đối tác</th>
                                    <th>Thời gian/Ngày</th>

                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div className="user-info">
                                            <div className="user-avatar" style={{ backgroundColor: '#6a1b9a' }}>NA</div>
                                            <div>
                                                <strong>Nguyễn A</strong><br />
                                                <span className="role mentor">Mentor</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <strong>09:00 - 10:00</strong><br />
                                        <span className="muted">Thứ Năm, 12/12/2025</span>
                                        <div className="note-row">
                                            <span className="note-label">Ghi chú:</span>
                                            <span className="note-text">Thảo luận mục tiêu học kỳ và kế hoạch theo tuần.</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="user-info">
                                            <div className="user-avatar" style={{ backgroundColor: 'var(--primary-color)' }}>TB</div>
                                            <div>
                                                <strong>Trần B</strong><br />
                                                <span className="role mentee">Mentee</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <strong>14:00 - 15:00</strong><br />
                                        <span className="muted">Thứ Sáu, 13/12/2025</span>
                                        <div className="note-row">
                                            <span className="note-label">Ghi chú:</span>
                                            <span className="note-text">Review code module X, chuẩn bị câu hỏi cho buổi sau.</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    )}

                </div>
            </div>
        </div>
    );
}