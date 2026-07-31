import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFinanceStore } from '../store/useFinanceStore';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowRight,
  PlusCircle,
  AlertTriangle,
  CheckCircle,
  CalendarDays,
  ShoppingBag,
  PiggyBank
} from 'lucide-react';
import { format } from 'date-fns';
import mascotWelcoming from '../assets/mascot_welcoming.png';

export const Dashboard: React.FC = () => {
  const {
    transactions,
    categories,
    selectedMonth,
    getMetrics,
    getBudgetUsage,
    addTransaction,
    user
  } = useFinanceStore();

  const displayUser = user?.user_metadata?.username || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'Thành viên';

  // Quick transaction form states
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Get metrics
  const { balance, totalIncome, totalExpense, totalSavings } = getMetrics();

  // Get budgets usage
  const budgetUsage = getBudgetUsage();

  // Filter categories by type (salary/income other is income, rest are expense by default in seed, or user-selected)
  // Let's just allow selecting any category
  const activeCategories = categories;

  // Handle Quick Add Transaction
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setFormError('Vui lòng nhập số tiền hợp lệ (> 0).');
      return;
    }
    if (!categoryId) {
      setFormError('Vui lòng chọn danh mục.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(false);

    try {
      await addTransaction({
        type,
        amount: Number(amount),
        category_id: categoryId,
        description: description || (type === 'income' ? 'Thu nhập nhanh' : 'Chi tiêu nhanh'),
        date,
      });

      setAmount('');
      setDescription('');
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 3000);
    } catch (err: any) {
      setFormError(err.message || 'Lỗi khi ghi nhận giao dịch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format month label in Vietnamese (e.g. "Tháng 07 năm 2026")
  const getMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return `Tháng ${month}/${year}`;
  };

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white leading-tight">
            Bảng điều khiển tài chính
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi dòng tiền trong <span className="font-semibold text-indigo-600 dark:text-indigo-400">{getMonthLabel(selectedMonth)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Hôm nay: {format(new Date(), 'dd/MM/yyyy')}
          </span>
        </div>
      </div>

      {/* CUTE WELCOMING BANNER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center justify-between overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="space-y-1 pr-4">
          <h3 className="text-base font-extrabold text-slate-950 dark:text-white leading-tight flex items-center gap-2 m-0">
            Chào mừng {displayUser} 🐒
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 m-0 mt-0.5">
            Hôm nay bạn chi tiêu thế nào rồi? Chú khỉ con sẽ đồng hành giúp bạn quản lý ngân sách và tiết kiệm tiền trong <span className="font-semibold text-indigo-600 dark:text-indigo-400">{getMonthLabel(selectedMonth)}</span> nhé!
          </p>
        </div>
        <div className="h-14 w-14 flex-shrink-0 relative hidden sm:block">
          <img src={mascotWelcoming} className="w-full h-full object-contain animate-bounce" style={{ animationDuration: '3.5s' }} alt="Welcoming Monkey" />
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Balance Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-800 text-white rounded-3xl p-6 shadow-xl shadow-indigo-600/20">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-2xl" />

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider uppercase opacity-85">Số dư khả dụng</span>
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl">
              <Wallet className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold tracking-tight">
              {balance.toLocaleString()} <span className="text-lg font-medium">TWD</span>
            </h3>
            <p className="text-[11px] opacity-75 mt-2 flex items-center gap-1">
              {balance >= 0 ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" /> Dòng tiền dương
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" /> Số dư âm! Hãy cắt giảm chi tiêu.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Income Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tổng thu nhập</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              +{totalIncome.toLocaleString()} <span className="text-lg font-medium text-slate-500">TWD</span>
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
              Khoản tiền thu về trong tháng
            </p>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tổng chi tiêu</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              -{totalExpense.toLocaleString()} <span className="text-lg font-medium text-slate-500">TWD</span>
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
              Khoản tiền chi ra trong tháng
            </p>
          </div>
        </div>

        {/* Savings Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Đã tiết kiệm</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600 dark:text-amber-400">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {totalSavings.toLocaleString()} <span className="text-lg font-medium text-slate-500">TWD</span>
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
              Khoản tích lũy được bỏ heo đất
            </p>
          </div>
        </div>
      </div>

      {/* MID SECTION: QUICK FORM + RECENT TRANSACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Add Transaction Form (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md">
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">Ghi chép nhanh</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Thêm nhanh một giao dịch phát sinh</p>

          <form onSubmit={handleQuickAdd} className="space-y-4">
            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${type === 'expense'
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950'
                  }`}
              >
                Khoản chi (-)
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${type === 'income'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950'
                  }`}
              >
                Khoản thu (+)
              </button>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Số tiền (TWD)
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ví dụ: 150"
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Danh mục
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
              >
                <option value="">-- Chọn danh mục --</option>
                {activeCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Ngày giao dịch
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Ghi chú
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập ghi chú ngắn..."
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Feedbacks */}
            {formError && <p className="text-xs text-rose-500 font-medium">{formError}</p>}
            {formSuccess && <p className="text-xs text-emerald-500 font-medium flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Đã lưu giao dịch thành công!</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-600/50 text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              {isSubmitting ? 'Đang lưu...' : 'Thêm giao dịch'}
            </button>
          </form>
        </div>

        {/* Recent Transactions List (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Giao dịch gần đây</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Lịch sử giao dịch mới nhất tháng này</p>
              </div>
              <Link
                to="/transactions"
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Tất cả <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-600">
                <ShoppingBag className="w-12 h-12 stroke-[1.5] mb-2" />
                <p className="text-sm font-medium">Chưa có giao dịch nào trong tháng này.</p>
                <p className="text-xs">Hãy ghi chép khoản thu/chi đầu tiên ở form bên cạnh!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[340px] overflow-y-auto scrollbar-none pr-1">
                {recentTransactions.map((tx) => {
                  const isExpense = tx.type === 'expense';
                  return (
                    <div key={tx.id} className="flex items-center justify-between py-3.5 group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 px-2 rounded-xl transition-all">
                      <div className="flex items-center gap-3">
                        {/* Category Icon Ball */}
                        <div
                          className="h-10 w-10 rounded-2xl flex items-center justify-center text-lg shadow-sm"
                          style={{
                            backgroundColor: tx.category?.color ? `${tx.category.color}15` : '#64748B15',
                            border: `1px solid ${tx.category?.color ? `${tx.category.color}30` : '#64748B30'}`
                          }}
                        >
                          {tx.category?.icon || '❓'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {tx.description}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {tx.category?.name || 'Không xác định'} • {format(new Date(tx.date), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-extrabold ${isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                      >
                        {isExpense ? '-' : '+'}
                        {Number(tx.amount).toLocaleString()} TWD
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick tips display */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">💡 Mẹo tài chính:</span>
            <span>Đặt hạn mức ngân sách chi tiêu giúp bạn kiểm soát rủi ro chi tiêu vượt trội tốt hơn!</span>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: ACTIVE BUDGET PROGRESS BAR SUMMARY */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Tiến độ hạn mức chi tiêu</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tình hình sử dụng ngân sách các danh mục trong tháng này</p>
          </div>
          <Link
            to="/budgets"
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Quản lý ngân sách <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {budgetUsage.length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500">
            <p className="text-sm font-medium">Chưa cấu hình ngân sách chi tiêu nào.</p>
            <Link
              to="/budgets"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold mt-1 inline-block"
            >
              Đặt ngân sách đầu tiên ngay &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budgetUsage.map((usage) => {
              const capLimit = Number(usage.budget.limit_amount);
              return (
                <div key={usage.budget.id} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{usage.budget.category?.icon}</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {usage.budget.category?.name}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Đã dùng: <span className="font-bold text-slate-800 dark:text-slate-200">{usage.spent.toLocaleString()}</span> / {capLimit.toLocaleString()} TWD
                    </span>
                  </div>

                  {/* Progress bar container */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${usage.exceeded ? 'bg-gradient-to-r from-rose-500 to-red-600' : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                        }`}
                      style={{ width: `${Math.min(usage.percent, 100)}%` }}
                    />
                  </div>

                  {/* Exceeded Warning */}
                  <div className="flex justify-between items-center mt-2.5">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      Tỷ lệ tiêu dùng: {usage.percent.toFixed(0)}%
                    </span>
                    {usage.exceeded && (
                      <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Vượt {usage.overAmount.toLocaleString()} TWD
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
