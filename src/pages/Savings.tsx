import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { PiggyBank, PlusCircle, AlertCircle, Calendar, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import mascotSaving from '../assets/mascot_saving.png';

export const Savings: React.FC = () => {
  const { savings, addSaving, deleteSaving, getMetrics, isLoading, error } = useFinanceStore();
  const { totalSavings, balance } = getMetrics();

  // Form states
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setFormError('Vui lòng nhập số tiền tiết kiệm hợp lệ.');
      return;
    }

    if (numericAmount > balance) {
      setFormError('Số tiền tiết kiệm vượt quá số dư khả dụng hiện có!');
      return;
    }

    if (!description.trim()) {
      setFormError('Vui lòng nhập ghi chú mục đích tiết kiệm.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addSaving({
        amount: numericAmount,
        description: description.trim(),
        date,
      });
      // Reset form
      setAmount('');
      setDescription('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
    } catch (err: any) {
      setFormError(err.message || 'Có lỗi xảy ra khi thêm khoản tiết kiệm.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khoản tích lũy này? Số tiền này sẽ quay trở lại số dư khả dụng.')) {
      try {
        await deleteSaving(id);
      } catch (err) {
        alert('Không thể xóa khoản tiết kiệm.');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white leading-tight">
            Quỹ tiết kiệm heo đất
          </h2>
          <p className="text-sm text-slate-555 dark:text-slate-400 mt-1">
            Dành riêng những khoản tiền tích lũy và không đụng tới để thực hiện mục tiêu lớn
          </p>
        </div>
      </div>

      {/* ERROR ALERT */}
      {(error || formError) && (
        <div className="flex items-start gap-2.5 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-2xl text-rose-600 dark:text-rose-450 text-xs font-semibold">
          <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
          <span>{formError || error}</span>
        </div>
      )}

      {/* CORE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: PIGGY BANNER & FORM */}
        <div className="lg:col-span-1 space-y-6">
          {/* MASCOT SAVINGS CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-amber-500" />
            <div className="w-32 h-32 my-2 animate-bounce" style={{ animationDuration: '4s' }}>
              <img src={mascotSaving} className="w-full h-full object-contain" alt="Mascot Saving Monkey" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-2">
              Heo đất Monkey Saving
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[220px]">
              Tích tiểu thành đại! Hãy kiên trì trích quỹ mỗi khi có nguồn thu nhập mới nhé.
            </p>
            
            <div className="mt-5 w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
                Tổng tích lũy tháng này
              </span>
              <span className="text-2xl font-black text-amber-550 dark:text-amber-400 mt-1">
                {totalSavings.toLocaleString('zh-TW')} <span className="text-sm font-semibold">TWD</span>
              </span>
              <div className="w-full border-t border-slate-200/50 dark:border-slate-800/50 my-2.5" />
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                Khấu trừ từ dòng thu nhập của bạn
              </span>
            </div>
          </div>

          {/* ADD SAVINGS FORM */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-amber-500" />
              Bỏ heo tiết kiệm mới
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase">
                  Số tiền trích lũy (TWD)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ví dụ: 5000"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase">
                  Mục tiêu / Ghi chú
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ví dụ: Tiết kiệm lương tháng 7"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase">
                  Ngày trích quỹ
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:bg-amber-500/50 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-amber-500/10 cursor-pointer flex items-center justify-center gap-2 mt-2 text-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4.5 h-4.5" />
                    Bỏ heo ngay
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: HISTORY LIST */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Lịch sử tích lũy trong tháng
            </h3>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                <span className="text-xs">Đang tải lịch sử tiết kiệm...</span>
              </div>
            ) : savings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <PiggyBank className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-xs font-semibold">Chưa có khoản tiết kiệm nào trong tháng này.</p>
                <p className="text-[10px] text-slate-400 mt-1">Hãy trích tiết kiệm đầu tháng để tích lũy tài sản nhé!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      <th className="pb-3 pl-3">Ngày</th>
                      <th className="pb-3">Mô tả / Mục đích</th>
                      <th className="pb-3 text-right">Số tiền</th>
                      <th className="pb-3 text-center w-16">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savings.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 text-sm text-slate-700 dark:text-slate-350 transition-colors"
                      >
                        <td className="py-3.5 pl-3 text-xs font-medium text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-300" />
                            {format(new Date(s.date), 'dd/MM/yyyy')}
                          </div>
                        </td>
                        <td className="py-3.5 font-semibold text-slate-900 dark:text-white">
                          {s.description}
                        </td>
                        <td className="py-3.5 text-right font-black text-amber-600 dark:text-amber-400">
                          +{Number(s.amount).toLocaleString('zh-TW')} TWD
                        </td>
                        <td className="py-3.5 text-center">
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 rounded-lg transition-all"
                            title="Xóa khoản tiết kiệm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
