import React from 'react';
import '../styles/ProfileSetup.css';

export default function Profile() {
    return (
        <div className="profile-setup-container">
            <div className="profile-setup-card">
                <h1>Thông tin cá nhân</h1>
                <p>Trang hồ sơ đang được hoàn thiện. Bạn có thể cập nhật thông tin trong phần Cài đặt.</p>
                <div style={{ display: 'flex', gap: 12 }}>
                    <a className="btn-primary" href="/settings">Mở Cài đặt</a>
                    <a className="btn-ghost" href="/dashboard">Về Dashboard</a>
                </div>
            </div>
        </div>
    );
}