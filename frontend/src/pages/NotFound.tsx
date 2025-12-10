import React from 'react';

export default function NotFound() {
    return (
        <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
            <div style={{ maxWidth: 540, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
                <h1 style={{ marginTop: 0 }}>Không tìm thấy trang</h1>
                <p>Đường dẫn bạn truy cập không tồn tại. Vui lòng quay lại Dashboard hoặc đăng nhập.</p>
                <div style={{ display: 'flex', gap: 12 }}>
                    <a href="/dashboard" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', textDecoration: 'none' }}>Về Dashboard</a>
                    <a href="/login" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', textDecoration: 'none' }}>Đăng nhập</a>
                </div>
            </div>
        </div>
    );
}