// =============================================
// Admin Header Component
// Header chính cho trang Admin Dashboard
// =============================================

import React from 'react';
import '../../styles/Header.css';
import { useAdminAuth } from '../contexts/AdminAuthContext';

// ============ TYPES ============

interface HeaderProps {
    /** Callback khi mở bộ lọc (tùy chọn) */
    onOpenFilter?: () => void;
}

// ============ COMPONENT ============

export default function HeaderAdmin({ onOpenFilter }: HeaderProps) {
    const { logout, admin } = useAdminAuth();

    return (
        <header className="dashboard-header">
            <div className="header-logo">
                <img src="/GrowNet_icon.png" alt="GrowNet" />
                <span>GrowNet Admin</span>
            </div>
            <div className="header-actions">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 14, color: '#475569' }}></span>
                    <button type="button" className='logoutAdmin-btn' onClick={logout} title="Đăng xuất">
                        Đăng xuất
                    </button>
                </div>
            </div>
        </header>
    );
}
