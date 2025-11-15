// =============================================
// Admin Login Component
// Trang đăng nhập cho Admin
// =============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Auth.css';

// ============ CONSTANTS ============

// Mật khẩu demo (CHỈ DÙNG CHO DEMO - Production cần thay bằng API thực)
const SECRET_KEY = '123456';

// ============ COMPONENT ============

export default function LoginAdmin() {
    // ============ HOOKS ============
    const navigate = useNavigate();

    // ============ STATE ============
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // ============ HANDLERS ============

    /**
     * Xử lý thay đổi input password
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        setError(''); // Xóa lỗi khi user nhập lại
    };

    /**
     * Xử lý submit form đăng nhập
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // TODO: Thay bằng API call thực tế
            // const response = await fetch('/api/admin/login', { ... });

            if (password === SECRET_KEY) {
                // Đăng nhập thành công
                navigate('/admin/dashboard');
            } else {
                setError('Mật khẩu không đúng. Vui lòng thử lại.');
            }
        } catch (err) {
            setError('Đã xảy ra lỗi. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <img src="/logo.png" alt="GrowNet" />
                    <img src="/GrowNet_icon.png" alt="GrowNet" />
                </div>

                <h1 className="auth-title">Đăng nhập Admin</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Vui lòng nhập mật khẩu"
                            value={password}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit" className="btn-auth" disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>

                    <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
                        Demo: Mật khẩu là "123456"
                    </p>
                </form>
            </div>
        </div>
    )
}
