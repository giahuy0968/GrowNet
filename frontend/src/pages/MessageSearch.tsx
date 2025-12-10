import React, { useState } from 'react';

export default function MessageSearch() {
    const [q, setQ] = useState('');
    return (
        <div style={{ padding: 24 }}>
            <h1>Tìm kiếm tin nhắn</h1>
            <div style={{ display: 'flex', gap: 8 }}>
                <input
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    placeholder="Nhập từ khóa..."
                    style={{ padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <button style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>Tìm</button>
            </div>
            <p style={{ color: '#64748b' }}>Kết quả sẽ hiển thị ở đây.</p>
        </div>
    );
}