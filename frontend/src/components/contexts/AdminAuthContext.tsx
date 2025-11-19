// =============================================
// Admin Authentication Context
// Quản lý xác thực và phân quyền admin
// =============================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ============ TYPES ============

interface AdminUser {
    id: string;
    role: 'admin';
    loginTime: number;
}

interface AdminAuthContextType {
    admin: AdminUser | null;
    login: (password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

// ============ CONTEXT ============

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

// ============ CONSTANTS ============

const ADMIN_STORAGE_KEY = 'grownet_admin_session';
const SECRET_KEY = '123456'; // TODO: Thay bằng API thực tế

// ============ PROVIDER ============

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Khôi phục session từ localStorage khi app khởi động
    useEffect(() => {
        const savedAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);
        if (savedAdmin) {
            try {
                const adminData = JSON.parse(savedAdmin) as AdminUser;
                const sessionAge = Date.now() - adminData.loginTime;
                const maxSessionAge = 24 * 60 * 60 * 1000;
                if (sessionAge < maxSessionAge) {
                    setAdmin(adminData);
                } else {
                    localStorage.removeItem(ADMIN_STORAGE_KEY);
                }
            } catch (error) {
                console.error('Error restoring admin session:', error);
                localStorage.removeItem(ADMIN_STORAGE_KEY);
            }
        }
        setLoading(false);
    }, []);

    /**
     * Đăng nhập admin
     */
    const login = async (password: string): Promise<void> => {
        // TODO: Thay bằng API call thực tế
        // const response = await fetch('/api/admin/login', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ password }),
        // });

        // Kiểm tra password (mock)
        if (password !== SECRET_KEY) {
            throw new Error('Mật khẩu không đúng. Vui lòng thử lại.');
        }

        // Tạo admin session
        const adminUser: AdminUser = {
            id: 'admin_' + Date.now(),
            role: 'admin',
            loginTime: Date.now(),
        };

        // Lưu session
        setAdmin(adminUser);
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));

        // Redirect về dashboard
        navigate('/admin/dashboard');
    };

    /**
     * Đăng xuất admin
     */
    const logout = () => {
        setAdmin(null);
        localStorage.removeItem(ADMIN_STORAGE_KEY);
        navigate('/admin/login');
    };

    const value: AdminAuthContextType = {
        admin,
        login,
        logout,
        isAuthenticated: !!admin,
        loading,
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
}

// ============ HOOK ============

/**
 * Hook để sử dụng AdminAuthContext
 */
export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth phải được sử dụng trong AdminAuthProvider');
    }
    return context;
}
