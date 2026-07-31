import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useFinanceStore } from '../store/useFinanceStore';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { user, isAuthLoading } = useFinanceStore();

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="mt-4 font-medium animate-pulse">Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
