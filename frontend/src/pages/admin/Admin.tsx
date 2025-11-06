import { useState } from 'react';

export default function GrowNetDashboard() {
    const [searchTerm, setSearchTerm] = useState('');

    const accounts = [
        { id: 'U00123', name: 'Trần Văn A', email: 'vana@email.com', role: 'Mentor', status: 'Cảnh cáo', reports: 3 },
        { id: 'U00456', name: 'Lê Thị B', email: 'thib@email.com', role: 'Mentor', status: 'Hoạt động', reports: 0 },
        { id: 'U00789', name: 'Nguyễn Văn C', email: 'vanc@email.com', role: 'Mentor', status: 'Đã khóa', reports: 5 }
    ];

    return (
        <div style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src="/logo.svg" alt="GrowNet Logo" width={24} height={24} />
                <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>GrowNet</h1>
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '20px' }}>Danh sách Tài khoản</h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo Tên, Email, ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        flex: 1
                    }}
                />
                <button style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    cursor: 'pointer'
                }}>
                    Lọc
                </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '6px' }}>
                <thead style={{ backgroundColor: '#f1f5f9' }}>
                    <tr>
                        <th style={{ padding: '8px', textAlign: 'left' }}>ID</th>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Trạng thái</th>
                        <th>Số lượt báo cáo</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {accounts.map(acc => (
                        <tr key={acc.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '8px' }}>{acc.id}</td>
                            <td>{acc.name}</td>
                            <td>{acc.email}</td>
                            <td>{acc.role}</td>
                            <td>{acc.status}</td>
                            <td>{acc.reports}</td>
                            <td>
                                <button style={{
                                    backgroundColor: '#e2e8f0',
                                    border: 'none',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    marginRight: '4px',
                                    cursor: 'pointer'
                                }}>Khóa tạm thời</button>
                                <button style={{
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}>Xóa vĩnh viễn</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '30px' }}>Quản lý Tags</h2>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                    type="text"
                    placeholder="Thêm tag mới..."
                    style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        flex: 1
                    }}
                />
                <button style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    cursor: 'pointer'
                }}>Thêm Tag</button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: '9999px' }}>Digital Marketing</span>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '9999px' }}>Lập trình Backend</span>
                <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '9999px' }}>Thiết kế UI/UX</span>
                <span style={{ background: '#bfdbfe', color: '#1e3a8a', padding: '4px 10px', borderRadius: '9999px' }}>Tài chính cá nhân</span>
            </div>
        </div>
    );
}
