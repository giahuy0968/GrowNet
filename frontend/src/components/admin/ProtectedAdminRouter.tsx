import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

interface ProtectedAdminRouteProps {
    children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
    const { isAuthenticated, loading } = useAdminAuth();
    const location = useLocation();

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang kiểm tra phiên...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}

export function AdminPublicRoute({ children }: ProtectedAdminRouteProps) {
    const { isAuthenticated, loading } = useAdminAuth();

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải...</div>;
    }

    if (isAuthenticated) {
        return <Navigate to="/admin/dashboard" replace />;
    }
    return <>{children}</>;
}