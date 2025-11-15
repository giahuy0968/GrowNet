import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

interface ProtectedAdminRouteProps {
    children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
    const { isAuthenticated } = useAdminAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Chưa đăng nhập → redirect về login
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}

export function AdminPublicRoute({ children }: ProtectedAdminRouteProps) {
    const { isAuthenticated } = useAdminAuth();

    if (isAuthenticated) {
        // Đã đăng nhập → redirect về dashboard
        return <Navigate to="/admin/dashboard" replace />;
    }
    return <>{children}</>;
}