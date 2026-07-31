import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  Calendar,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { format } from 'date-fns';
import type { Transaction } from '../types';

export const Transactions: React.FC = () => {
  const {
    transactions,
    categories,
    addTransaction,
    editTransaction,
    deleteTransaction,
    isLoading
  } = useFinanceStore();

  // Search & filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  // Modal open states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Form states
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Open add modal
  const openAddModal = () => {
    setAmount('');
    setCategoryId(categories[0]?.id || '');
    setType('expense');
    setDescription('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setError(null);
    setIsAddModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setAmount(tx.amount.toString());
    setCategoryId(tx.category_id || '');
    setType(tx.type);
    setDescription(tx.description);
    setDate(tx.date);
    setError(null);
    setIsEditModalOpen(true);
  };

  // Handle Add Transaction
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ (> 0)');
      return;
    }
    if (!categoryId) {
      setError('Vui lòng chọn một danh mục');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addTransaction({
        type,
        amount: Number(amount),
        category_id: categoryId,
        description,
        date,
      });
      setIsAddModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo giao dịch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Transaction
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransaction) return;
    if (!amount || Number(amount) <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ (> 0)');
      return;
    }
    if (!categoryId) {
      setError('Vui lòng chọn một danh mục');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await editTransaction(selectedTransaction.id, {
        type,
        amount: Number(amount),
        category_id: categoryId,
        description,
        date,
      });
      setIsEditModalOpen(false);
      setSelectedTransaction(null);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi chỉnh sửa giao dịch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Transaction
  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này không?')) {
      try {
        await deleteTransaction(id);
      } catch (err) {
        console.error('Lỗi khi xóa giao dịch:', err);
        alert('Lỗi xảy ra khi xóa giao dịch.');
      }
    }
  };

  // Filter local transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || tx.category_id === categoryFilter;
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  // Group transactions by date
  const groupedTransactions: { [dateStr: string]: Transaction[] } = {};
  filteredTransactions.forEach((tx) => {
    if (!groupedTransactions[tx.date]) {
      groupedTransactions[tx.date] = [];
    }
    groupedTransactions[tx.date].push(tx);
  });

  // Sorted dates keys
  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => b.localeCompare(a)
  );

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

    if (dateStr === today) return 'Hôm nay';
    if (dateStr === yesterday) return 'Hôm qua';
    return format(d, 'dd/MM/yyyy');
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">Lịch sử giao dịch</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Xem và lọc danh sách chi tiêu, thu nhập của bạn
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl transition-all shadow-sm shadow-indigo-600/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Thêm giao dịch
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search */}
        <div className="md:col-span-5 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo ghi chú..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all"
          />
        </div>

        {/* Type Filter */}
        <div className="md:col-span-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Filter className="w-4 h-4" />
            </span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full pl-9 pr-3 py-2 bg-slate-100/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white appearance-none"
            >
              <option value="all">Tất cả giao dịch</option>
              <option value="expense">Khoản chi</option>
              <option value="income">Khoản thu</option>
            </select>
          </div>
        </div>

        {/* Category Filter */}
        <div className="md:col-span-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <FolderOpen className="w-4.5 h-4.5" />
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-100/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white appearance-none"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TRANSACTIONS GRID/LIST GROUPED BY DATE */}
      {isLoading ? (
        <div className="text-center py-20">
          <p className="text-sm font-semibold text-slate-400 animate-pulse">Đang đồng bộ hóa giao dịch...</p>
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
          <p className="text-slate-400 dark:text-slate-600 mb-1 font-semibold">Không tìm thấy giao dịch nào</p>
          <p className="text-xs text-slate-400">Hãy thử đổi bộ lọc hoặc thêm giao dịch mới.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateStr) => (
            <div key={dateStr} className="space-y-2">
              {/* Date Header Badge */}
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {formatDateLabel(dateStr)} ({groupedTransactions[dateStr].length} giao dịch)
                </h4>
              </div>

              {/* Day's Transactions Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden">
                {groupedTransactions[dateStr].map((tx) => {
                  const isExpense = tx.type === 'expense';
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 group hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center text-lg shadow-sm"
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
                            {tx.category?.name || 'Không xác định'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span
                          className={`text-sm font-extrabold ${
                            isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {isExpense ? '-' : '+'}
                          {Number(tx.amount).toLocaleString()} TWD
                        </span>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(tx)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                            title="Sửa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==========================================
          ADD/EDIT TRANSACTION MODALS
      ========================================== */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-xl relative">
            
            {/* Close Button */}
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedTransaction(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-1.5">
              {isAddModalOpen ? 'Thêm giao dịch mới' : 'Chỉnh sửa giao dịch'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              {isAddModalOpen ? 'Nhập thông tin giao dịch cần lưu trữ' : 'Chỉnh sửa các trường cần cập nhật'}
            </p>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-xl text-rose-600 dark:text-rose-400 text-xs mb-4">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit} className="space-y-4">
              
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    type === 'expense'
                      ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950'
                  }`}
                >
                  Khoản chi (-)
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    type === 'income'
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
                  placeholder="0.00"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
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
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
                >
                  {categories.map((cat) => (
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
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Ghi chú
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả ngắn, ví dụ: Mua cơm trưa"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    setSelectedTransaction(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-semibold text-xs rounded-xl cursor-pointer"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu giao dịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
