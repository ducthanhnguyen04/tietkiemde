import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useFinanceStore } from '../store/useFinanceStore';
import mascotWelcoming from '../assets/mascot_welcoming.png';
import {
  LayoutDashboard,
  Receipt,
  Tag,
  Wallet,
  BarChart3,
  User,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Bell,
  TrendingDown,
  PiggyBank
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    signOut,
    selectedMonth,
    setSelectedMonth,
    getBudgetUsage
  } = useFinanceStore();

  const displayUser = user?.user_metadata?.username || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'Thành viên';
  const displayInitial = displayUser.charAt(0).toUpperCase();
  const rawAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const avatarUrl = typeof rawAvatar === 'string' && (rawAvatar.startsWith('http://') || rawAvatar.startsWith('https://')) ? rawAvatar : null;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [showNotifications, setShowNotifications] = useState(false);

  // Apply dark mode theme class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'dark'); // Wait, 'light'! Let's write 'light' for light mode
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Lỗi khi đăng xuất:', err);
    }
  };

  const navItems = [
    { name: 'Tổng quan', path: '/', icon: LayoutDashboard },
    { name: 'Giao dịch', path: '/transactions', icon: Receipt },
    { name: 'Danh mục', path: '/categories', icon: Tag },
    { name: 'Ngân sách', path: '/budgets', icon: Wallet },
    { name: 'Tiết kiệm', path: '/savings', icon: PiggyBank },
    { name: 'Thống kê', path: '/statistics', icon: BarChart3 },
    { name: 'Tài khoản', path: '/profile', icon: User },
  ];

  // Calculate budget alerts
  const budgetUsage = getBudgetUsage();
  const exceededBudgets = budgetUsage.filter((item) => item.exceeded);
  const totalExceededCount = exceededBudgets.length;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl z-20">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo Area */}
          <div className="flex items-center flex-shrink-0 px-6 gap-3 mb-8">
            <div className="h-11 w-11 overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 p-0.5 shadow-sm shadow-emerald-500/10 flex items-center justify-center">
              <img src={mascotWelcoming} className="w-full h-full object-contain" alt="Mascot" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
                Tiết kiệm đê!
              </span>
              <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">
                Nghe chưa
              </span>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1.5 pt-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-sm shadow-indigo-500/5'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* User & Sign Out Area */}
          <div className="flex-shrink-0 flex border-t border-slate-200 dark:border-slate-800 p-4">
            <div className="w-full flex flex-col gap-3">
              <div className="flex items-center gap-3 px-2">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-9 w-9 rounded-full object-cover border border-slate-250 dark:border-slate-800" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {displayInitial}
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {displayUser}
                  </p>
                  <p className="text-[10px] text-slate-450 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center px-4 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between w-full h-16 px-4 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 p-0.5 flex items-center justify-center">
              <img src={mascotWelcoming} className="w-full h-full object-contain" alt="Mascot" />
            </div>
          </div>
        </div>

        {/* Global Controls in Mobile Header */}
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs px-2 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
          />
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <div className={`md:hidden fixed inset-0 z-40 flex transition-all duration-300 ${isMobileMenuOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`}>
        <div
          className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div className={`relative flex flex-col flex-1 max-w-xs w-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 pt-5 pb-4 transition-transform duration-300 ease-out transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className={`absolute top-0 right-0 -mr-12 pt-2 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white bg-slate-900 text-white cursor-pointer"
            >
              <X className="h-6 h-6 text-white" />
            </button>
          </div>
          
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 gap-3 mb-6">
            <div className="h-10 w-10 overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 p-0.5 flex items-center justify-center">
              <img src={mascotWelcoming} className="w-full h-full object-contain" alt="Mascot" />
            </div>
            <span className="font-extrabold text-lg text-slate-900 dark:text-white">Tiết kiệm đê!</span>
          </div>

          {/* Menu */}
          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-xl ${isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Profile Footer */}
          <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-3 px-2 mb-3">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-9 w-9 rounded-full object-cover border border-slate-250 dark:border-slate-800" />
              ) : (
                <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {displayInitial}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {displayUser}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center px-4 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex flex-col flex-1 overflow-hidden md:pl-64">
        {/* DESKTOP TOP HEADER */}
        <header className="hidden md:flex items-center justify-between h-16 px-8 bg-white/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 backdrop-blur-xl z-10">
          <div>
            <h1 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider my-0">
              Chào mừng
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
              {displayUser}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Global Calendar Month Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tháng làm việc:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-sm transition-all"
              />
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all cursor-pointer"
              title="Chuyển chế độ giao diện"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Budget Alerts Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all cursor-pointer ${totalExceededCount > 0 ? 'animate-bounce' : ''
                  }`}
                title="Thông báo ngân sách"
              >
                <Bell className="w-5 h-5" />
                {totalExceededCount > 0 && (
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {/* Notification Popup Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 animate-fade-in">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Thông báo ngân sách</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Đóng
                    </button>
                  </div>
                  {totalExceededCount === 0 ? (
                    <p className="text-xs text-slate-500 py-2 text-center">Tất cả chi tiêu của bạn đều trong hạn mức cho phép. Tuyệt vời! 🎉</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-none">
                      {exceededBudgets.map((item) => (
                        <div
                          key={item.budget.id}
                          className="flex items-start gap-2.5 p-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-xl"
                        >
                          <TrendingDown className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                              Vượt ngân sách {item.budget.category?.name}
                            </p>
                            <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">
                              Hạn mức: {Number(item.budget.limit_amount).toLocaleString()} TWD.
                              Đã dùng: {item.spent.toLocaleString()} TWD (Vượt {item.overAmount.toLocaleString()} TWD).
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTAINER AND PAGE VIEWS */}
        <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8 bg-slate-50 dark:bg-slate-950/50 pt-20 md:pt-8 scrollbar-none">
          <div className="max-w-6xl mx-auto w-full animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
