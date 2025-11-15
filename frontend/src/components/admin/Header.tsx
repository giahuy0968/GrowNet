// =============================================
// Admin Header Component
// Header chính cho trang Admin Dashboard
// =============================================

import React from 'react';
import '../../styles/Header.css';

// ============ TYPES ============

interface HeaderProps {
    /** Callback khi mở bộ lọc (tùy chọn) */
    onOpenFilter?: () => void;
}

// ============ COMPONENT ============

export default function HeaderAdmin({ onOpenFilter }: HeaderProps) {
    return (
        <header className="dashboard-header">
            {/* Logo và tên ứng dụng */}
            <div className="header-logo">
                <img src="/GrowNet_icon.png" alt="GrowNet" />
                <span>GrowNet</span>
            </div>

            {/* Các nút hành động */}
            <div className="header-actions">
                <button className="icon-btn" aria-label="Messages">
                    💬
                </button>
                <button className="icon-btn" aria-label="Notifications">
                    🔔
                </button>
                <div className="user-avatar">
                    <img src="/user-avatar.jpg" alt="User Avatar" />
                </div>
            </div>
        </header>
    );
}
