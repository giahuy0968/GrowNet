// =============================================
// Admin Routes Component (moved into src)
// Định nghĩa routing cho admin dashboard
// =============================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../components/admin/Charts';
import Tables from '../components/admin/Tables';
import TagsManagement from '../components/admin/TagsManagement';
import HeaderAdmin from '../components/admin/Header';
import LoginAdmin from '../components/admin/LoginAdmin';
import { AdminAuthProvider } from '../components/contexts/AdminAuthContext';
import { ProtectedAdminRoute, AdminPublicRoute } from '../components/admin/ProtectedAdminRouter';

export default function AdminRoutes() {
    return (
        <AdminAuthProvider>
            <Routes>
                {/* Redirect root admin về login */}
                <Route path="/" element={<Navigate to="login" replace />} />

                {/* Route công khai - Login page */}
                <Route
                    path="login"
                    element={
                        <AdminPublicRoute>
                            <LoginAdmin />
                        </AdminPublicRoute>
                    }
                />

                {/* Route được bảo vệ - Dashboard */}
                <Route
                    path="dashboard"
                    element={
                        <ProtectedAdminRoute>
                            <>
                                <HeaderAdmin />
                                <Dashboard />
                                <Tables />
                                <TagsManagement />
                            </>
                        </ProtectedAdminRoute>
                    }
                />

                {/* Catch all - redirect về login */}
                <Route path="*" element={<Navigate to="login" replace />} />
            </Routes>
        </AdminAuthProvider>
    );
}
