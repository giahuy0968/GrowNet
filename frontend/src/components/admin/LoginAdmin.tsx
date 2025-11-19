// =============================================
// Admin Login Component
// Trang đăng nhập cho Admin
// =============================================

import React, { useState } from 'react';
import '../../styles/AdminLogin.css';
import { useAdminAuth } from '../contexts/AdminAuthContext';

// ============ CONSTANTS ============

// Sử dụng login từ context (SECRET_KEY kiểm tra ở context)

// ============ COMPONENT ============

export default function LoginAdmin() {
    // ============ HOOKS ============
    const { login } = useAdminAuth();

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
            await login(password);
            // Thành công: login() đã điều hướng sang dashboard
        } catch (err: any) {
            setError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <img src="/GrowNet_icon.png" alt="GrowNet" />
                </div>

                <h1 className="auth-title">GrownNet Admin</h1>
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

                </form>
            </div>
        </div>
    )
}
