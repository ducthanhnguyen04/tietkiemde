import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinanceStore } from '../store/useFinanceStore';
import { LogOut, Calendar, ShieldCheck, Database } from 'lucide-react';
import { format } from 'date-fns';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, categories, transactions, budgets } = useFinanceStore();

  const displayUser = user?.user_metadata?.username || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'Thành viên';
  const displayInitial = displayUser.charAt(0).toUpperCase();
  const rawAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const avatarUrl = typeof rawAvatar === 'string' && (rawAvatar.startsWith('http://') || rawAvatar.startsWith('https://')) ? rawAvatar : null;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Lỗi đăng xuất:', err);
    }
  };

  // Safe parse created_at date
  const getCreatedDate = () => {
    if (!user?.created_at) return 'Không rõ';
    try {
      return format(new Date(user.created_at), 'dd/MM/yyyy HH:mm');
    } catch {
      return 'Không rõ';
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* PAGE HEADER */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">Hồ sơ tài khoản</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Quản lý tài khoản đăng nhập và xem thông số đồng bộ dữ liệu
        </p>
      </div>

      {/* USER CARD PROFILE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        {/* Decorative backdrop gradients */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
        
        {/* User Icon ball or Avatar */}
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="h-16 w-16 rounded-3xl object-cover border border-slate-200 dark:border-slate-800 shadow-sm" />
        ) : (
          <div className="h-16 w-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-2xl shadow-sm">
            {displayInitial}
          </div>
        )}

        <div className="flex-1 space-y-4 text-center md:text-left">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{displayUser}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{user?.email}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
              <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>
                Ngày gia nhập: <span className="font-semibold text-slate-800 dark:text-slate-200">{getCreatedDate()}</span>
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>
                Trạng thái bảo mật: <span className="font-semibold text-emerald-600 dark:text-emerald-450">Bảo vệ qua RLS (Supabase)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SYNCHRONIZATION STATS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-950 dark:text-white mb-4 text-sm flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-500" />
          Thống kê dữ liệu cá nhân
        </h3>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Danh mục</p>
            <p className="text-2xl font-extrabold text-indigo-650 dark:text-indigo-400 mt-1">
              {categories.length}
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giao dịch</p>
            <p className="text-2xl font-extrabold text-indigo-650 dark:text-indigo-400 mt-1">
              {transactions.length}
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ngân sách</p>
            <p className="text-2xl font-extrabold text-indigo-650 dark:text-indigo-400 mt-1">
              {budgets.length}
            </p>
          </div>
        </div>
      </div>

      {/* SIGN OUT BOX */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-xs">Kết thúc phiên làm việc</h4>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Xóa cookie đăng nhập và phiên làm việc hiện tại</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-600 font-bold text-xs rounded-xl cursor-pointer transition-all"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
};
