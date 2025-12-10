import React, { useState } from 'react';
import '../styles/ScheduleDetail.css';

type TabKey = 'confirmed' | 'pending' | 'history';

export default function ScheduleDetail() {
    const [active, setActive] = useState<TabKey>('confirmed');

    return (
        <div className="schedule-page">
            <div className="schedule-container">
                <div className="schedule-header">
                    <button className="back-link" onClick={() => history.back()}>{'<'} Quay lại</button>
                    <h1>Quản lý Lịch trình Cố vấn Chi tiết</h1>
                </div>

                <div className="tabs-toolbar-wrapper">
                    <div className="tab-navigation">
                        <button
                            className={`tab-button ${active === 'confirmed' ? 'active' : ''}`}
                            onClick={() => setActive('confirmed')}
                        >
                            Đã xác nhận (2)
                        </button>
                        <button
                            className={`tab-button ${active === 'pending' ? 'active' : ''}`}
                            onClick={() => setActive('pending')}
                        >
                            Chờ xác nhận (1)
                        </button>
                        <button
                            className={`tab-button ${active === 'history' ? 'active' : ''}`}
                            onClick={() => setActive('history')}
                        >
                            Lịch sử (12)
                        </button>
                    </div>

                    <div className="toolbar">
                        <div className="search-box">
                            <input type="text" placeholder="Tìm kiếm theo Tên đối tác, Lĩnh vực..." />
                        </div>
                        <select className="filter-select">
                            <option value="all">Sắp xếp: Mới nhất</option>
                            <option value="oldest">Cũ nhất</option>
                            <option value="partner">Theo Đối tác</option>
                        </select>
                        <button className="btn-action btn-view-detail">Lọc Nâng cao</button>
                    </div>
                </div>

                <div className="schedule-table-wrapper">
                    {active === 'confirmed' && (
                        <table className="schedule-table">
                            <thead>
                                <tr>
                                    <th>Đối tác (Vai trò)</th>
                                    <th>Thời gian/Ngày</th>
                                    <th>Mục tiêu Cố vấn</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
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
                                    </td>
                                    <td>Gặp mặt lần đầu - Kế hoạch sự nghiệp</td>
                                    <td><span className="badge-status badge-confirmed">Đã xác nhận</span></td>
                                    <td>
                                        <button className="btn-action btn-view-detail">Chi tiết</button>
                                        <button className="btn-action btn-cancel">Hủy</button>
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
                                    </td>
                                    <td>Review CV & Portfolio Frontend</td>
                                    <td><span className="badge-status badge-confirmed">Đã xác nhận</span></td>
                                    <td>
                                        <button className="btn-action btn-view-detail">Chi tiết</button>
                                        <button className="btn-action btn-cancel">Hủy</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    )}

                    {active === 'pending' && (
                        <table className="schedule-table">
                            <thead>
                                <tr>
                                    <th>Đối tác (Vai trò)</th>
                                    <th>Thời gian/Ngày</th>
                                    <th>Mục tiêu Cố vấn</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div className="user-info">
                                            <div className="user-avatar" style={{ backgroundColor: '#d84315' }}>LD</div>
                                            <div>
                                                <strong>Lê D</strong><br />
                                                <span className="role mentee">Mentee</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <strong>16:00 - 17:00</strong><br />
                                        <span className="muted">Thứ Hai, 16/12/2025</span>
                                    </td>
                                    <td>Hỏi đáp về cách Tìm kiếm việc làm</td>
                                    <td><span className="badge-status badge-pending">Chờ bạn xác nhận</span></td>
                                    <td>
                                        <button className="btn-action btn-confirm">Xác nhận</button>
                                        <button className="btn-action btn-view-detail">Chi tiết</button>
                                        <button className="btn-action btn-cancel">Từ chối</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    )}

                    {active === 'history' && (
                        <table className="schedule-table">
                            <thead>
                                <tr>
                                    <th>Đối tác (Vai trò)</th>
                                    <th>Thời gian/Ngày</th>
                                    <th>Mục tiêu Cố vấn</th>
                                    <th>Kết quả</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div className="user-info">
                                            <div className="user-avatar" style={{ backgroundColor: '#4db6ac' }}>TC</div>
                                            <div>
                                                <strong>Trần C</strong><br />
                                                <span className="role mentor">Mentor</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <strong>10:00 - 11:00</strong><br />
                                        <span className="muted">01/12/2025</span>
                                    </td>
                                    <td>Đánh giá dự án Marketing</td>
                                    <td><span className="badge-status badge-completed">Hoàn thành</span></td>
                                    <td>
                                        <button className="btn-action btn-view-detail">Xem Phản hồi</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="user-info">
                                            <div className="user-avatar" style={{ backgroundColor: '#616161' }}>MV</div>
                                            <div>
                                                <strong>Minh V</strong><br />
                                                <span className="role mentee">Mentee</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <strong>15:00 - 16:00</strong><br />
                                        <span className="muted">28/11/2025</span>
                                    </td>
                                    <td>Tư vấn chọn ngành</td>
                                    <td><span className="badge-status badge-cancelled">Đã hủy</span></td>
                                    <td>
                                        <button className="btn-action btn-view-detail muted">Lý do Hủy</button>
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