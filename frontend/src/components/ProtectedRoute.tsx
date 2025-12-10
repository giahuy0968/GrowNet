import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) return null; // could render a spinner here
    if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
    return <>{children}</>;
};
