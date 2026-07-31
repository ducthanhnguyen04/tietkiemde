import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  Wallet,
  TrendingDown,
  Activity,
  CheckCircle
} from 'lucide-react';

export const Budgets: React.FC = () => {
  const {
    categories,
    selectedMonth,
    getBudgetUsage,
    upsertBudget,
    deleteBudget,
    isLoading
  } = useFinanceStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form states
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Retrieve calculated budget usage from Zustand
  const budgetUsage = getBudgetUsage();

  // Find categories that don't have budgets configured yet
  const categoriesWithoutBudget = categories.filter(
    (cat) => !budgetUsage.some((b) => b.budget.category_id === cat.id)
  );

  // Aggregated totals
  const totalBudgetLimit = budgetUsage.reduce((sum, item) => sum + Number(item.budget.limit_amount), 0);
  const totalBudgetSpent = budgetUsage.reduce((sum, item) => sum + item.spent, 0);
  const totalBudgetRemaining = Math.max(totalBudgetLimit - totalBudgetSpent, 0);
  const totalExceededCategories = budgetUsage.filter((item) => item.exceeded).length;

  const openAddModal = () => {
    setSelectedCategoryId(categoriesWithoutBudget[0]?.id || '');
    setLimitAmount('');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (categoryId: string, limit: number) => {
    setSelectedCategoryId(categoryId);
    setLimitAmount(limit.toString());
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId) {
      setError('Vui lòng chọn danh mục.');
      return;
    }
    if (!limitAmount || Number(limitAmount) < 0) {
      setError('Vui lòng nhập hạn mức hợp lệ (>= 0).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await upsertBudget(selectedCategoryId, Number(limitAmount));
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu hạn mức ngân sách.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, categoryName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ngân sách cho danh mục "${categoryName}" không?`)) {
      try {
        await deleteBudget(id);
      } catch (err) {
        console.error('Lỗi khi xóa ngân sách:', err);
        alert('Lỗi xảy ra khi xóa ngân sách.');
      }
    }
  };

  const getMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return `${month}/${year}`;
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">Thiết lập ngân sách</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Đặt giới hạn chi tiêu cho từng danh mục trong tháng <span className="font-semibold text-indigo-600 dark:text-indigo-400">{getMonthLabel(selectedMonth)}</span>
          </p>
        </div>
        
        {categoriesWithoutBudget.length > 0 && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl transition-all shadow-sm shadow-indigo-600/10 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Thêm ngân sách
          </button>
        )}
      </div>

      {/* OVERVIEW METRICS DASHBOARD */}
      {budgetUsage.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
          {/* Total Budget Limit */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Wallet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Tổng ngân sách</span>
            </div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5">
              {totalBudgetLimit.toLocaleString()} <span className="text-xs font-semibold text-slate-400">TWD</span>
            </p>
          </div>

          {/* Total Spent under budget */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <TrendingDown className="w-4 h-4 text-rose-500 dark:text-rose-450" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Tổng đã dùng</span>
            </div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5">
              {totalBudgetSpent.toLocaleString()} <span className="text-xs font-semibold text-slate-400">TWD</span>
            </p>
          </div>

          {/* Remaining Budget */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Activity className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Còn lại (an toàn)</span>
            </div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5">
              {totalBudgetRemaining.toLocaleString()} <span className="text-xs font-semibold text-slate-400">TWD</span>
            </p>
          </div>

          {/* Exceeded Categories count */}
          <div className={`p-4 rounded-2xl ${totalExceededCategories > 0 ? 'bg-rose-50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <AlertTriangle className={`w-4 h-4 ${totalExceededCategories > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
              <span className="text-[11px] font-bold uppercase tracking-wider">Danh mục vượt hạn mức</span>
            </div>
            <p className={`text-xl font-extrabold mt-1.5 ${totalExceededCategories > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              {totalExceededCategories}
            </p>
          </div>
        </div>
      )}

      {/* BUDGET PROGRESS CARDS */}
      {isLoading && budgetUsage.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm font-semibold text-slate-400 animate-pulse">Đang tải hạn mức chi tiêu...</p>
        </div>
      ) : budgetUsage.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
          <p className="text-slate-400 dark:text-slate-600 mb-2 font-semibold">Chưa có ngân sách chi tiêu nào được thiết lập</p>
          <p className="text-xs text-slate-400 mb-6">Việc đặt ngân sách giúp bạn giới hạn chi tiêu thông minh cho mỗi danh mục.</p>
          {categories.length > 0 ? (
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl cursor-pointer"
            >
              Thiết lập ngay
            </button>
          ) : (
            <p className="text-xs text-rose-500">Vui lòng tạo danh mục chi tiêu trước khi cấu hình ngân sách.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgetUsage.map((usage) => {
            const limit = Number(usage.budget.limit_amount);
            const isExceeded = usage.exceeded;
            const progressWidth = Math.min(usage.percent, 100);
            
            // Choose color depending on spending percent
            let progressColor = 'bg-gradient-to-r from-indigo-500 to-indigo-600';
            if (usage.percent >= 100) {
              progressColor = 'bg-gradient-to-r from-rose-500 to-red-600';
            } else if (usage.percent >= 80) {
              progressColor = 'bg-gradient-to-r from-amber-500 to-orange-600';
            }

            return (
              <div
                key={usage.budget.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm relative overflow-hidden group flex flex-col justify-between"
              >
                {/* Visual exceeded warning backdrop */}
                {isExceeded && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
                )}

                <div>
                  <div className="flex justify-between items-start mb-4">
                    {/* Category Details */}
                    <div className="flex items-center gap-3">
                      <div
                        className="h-11 w-11 rounded-2xl flex items-center justify-center text-xl shadow-sm"
                        style={{
                          backgroundColor: usage.budget.category?.color ? `${usage.budget.category.color}15` : '#64748B15',
                          border: `1px solid ${usage.budget.category?.color ? `${usage.budget.category.color}30` : '#64748B30'}`
                        }}
                      >
                        {usage.budget.category?.icon || '❓'}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                          {usage.budget.category?.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          Ngân sách định mức tháng
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(usage.budget.category_id, limit)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                        title="Chỉnh sửa hạn mức"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(usage.budget.id, usage.budget.category?.name || 'Không rõ')}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                        title="Xóa ngân sách"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Limit Amount metrics text */}
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Tiến độ chi tiêu:</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {usage.spent.toLocaleString()}
                      </span>{' '}
                      / {limit.toLocaleString()} TWD
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                      style={{ width: `${progressWidth}%` }}
                    />
                  </div>
                </div>

                {/* Subtext and alerts warnings */}
                <div>
                  {isExceeded ? (
                    <div className="flex items-start gap-1.5 p-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl mt-2 text-rose-600 dark:text-rose-455 text-[10px] font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        Hạn mức chi tiêu danh mục này đã bị vượt {usage.overAmount.toLocaleString()} TWD ({usage.percent.toFixed(0)}%).
                      </span>
                    </div>
                  ) : usage.percent >= 80 ? (
                    <div className="flex items-start gap-1.5 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl mt-2 text-amber-600 dark:text-amber-455 text-[10px] font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        Cảnh báo: Bạn đã dùng {usage.percent.toFixed(0)}% hạn mức được thiết lập. Hãy chú ý hơn.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-1.5 p-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl mt-2 text-emerald-600 dark:text-emerald-455 text-[10px] font-medium">
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Chi tiêu trong tầm kiểm soát an toàn. Còn lại {(limit - usage.spent).toLocaleString()} TWD.</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==========================================
          ADD/EDIT BUDGET DIALOG MODAL
      ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-xl relative">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-1.5">
              Thiết lập hạn mức ngân sách
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Đặt hoặc cập nhật số tiền chi tiêu tối đa mỗi tháng cho danh mục này
            </p>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-xl text-rose-600 dark:text-rose-455 text-xs mb-4">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Category */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Danh mục chi tiêu
                </label>
                {/* If editing, select is disabled. Otherwise let them select from categoriesWithoutBudget */}
                <select
                  disabled={budgetUsage.some((b) => b.budget.category_id === selectedCategoryId)}
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white disabled:opacity-75"
                >
                  <option value="" disabled>-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Limit Amount */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Hạn mức tối đa (TWD)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                  placeholder="Ví dụ: 5000"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-semibold text-xs rounded-xl cursor-pointer"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu ngân sách'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
