import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { dbService } from '../services/db';
import type { Transaction } from '../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { format, startOfYear, endOfYear, eachMonthOfInterval, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Calendar, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

export const Statistics: React.FC = () => {
  const { selectedMonth } = useFinanceStore();

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Fetch all user transactions (unfiltered by month) to perform historical metrics
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const data = await dbService.getTransactions(); // No month parameter = all transactions
      setAllTransactions(data);
    } catch (err) {
      console.error('Lỗi khi tải lịch sử thống kê:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [selectedMonth]);

  // Year options list from transactions history
  const yearOptions = Array.from(
    new Set([
      new Date().getFullYear().toString(),
      ...allTransactions.map(tx => new Date(tx.date).getFullYear().toString())
    ])
  ).sort((a, b) => b.localeCompare(a));

  // ==========================================
  // 1. DATA FOR LINE CHART: Monthly Income vs Expense
  // ==========================================
  const getLineChartData = () => {
    const yearNum = Number(selectedYear);
    const months = eachMonthOfInterval({
      start: startOfYear(new Date(yearNum, 0, 1)),
      end: endOfYear(new Date(yearNum, 11, 31))
    });

    return months.map(m => {
      const monthStr = format(m, 'yyyy-MM');
      const monthLabel = `T${format(m, 'MM')}`;
      
      let income = 0;
      let expense = 0;

      allTransactions.forEach(tx => {
        const txMonth = format(new Date(tx.date), 'yyyy-MM');
        if (txMonth === monthStr) {
          if (tx.type === 'income') {
            income += Number(tx.amount);
          } else {
            expense += Number(tx.amount);
          }
        }
      });

      return {
        name: monthLabel,
        'Thu nhập': income,
        'Chi tiêu': expense,
        'Thặng dư': income - expense
      };
    });
  };

  // ==========================================
  // 2. DATA FOR PIE CHART: Expense breakdown by Category (for selectedMonth)
  // ==========================================
  const getPieChartData = () => {
    const expenseMap: { [categoryName: string]: { amount: number; color: string } } = {};
    
    // Seed with empty categories to ensure all of them are referenced if needed, 
    // but we only want to display categories that have non-zero expenses.
    allTransactions.forEach(tx => {
      const txMonth = format(new Date(tx.date), 'yyyy-MM');
      if (txMonth === selectedMonth && tx.type === 'expense') {
        const catName = tx.category?.name || 'Chưa phân loại';
        const catColor = tx.category?.color || '#94A3B8';
        
        if (!expenseMap[catName]) {
          expenseMap[catName] = { amount: 0, color: catColor };
        }
        expenseMap[catName].amount += Number(tx.amount);
      }
    });

    return Object.entries(expenseMap).map(([name, val]) => ({
      name,
      value: val.amount,
      color: val.color
    })).sort((a, b) => b.value - a.value);
  };

  // ==========================================
  // 3. DATA FOR BAR CHART: Daily Cash Flow (for selectedMonth)
  // ==========================================
  const getBarChartData = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const days = eachDayOfInterval({
      start: startOfMonth(new Date(year, month - 1, 1)),
      end: endOfMonth(new Date(year, month - 1, 1))
    });

    return days.map(d => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayLabel = format(d, 'dd');
      
      let income = 0;
      let expense = 0;

      allTransactions.forEach(tx => {
        if (tx.date === dateStr) {
          if (tx.type === 'income') {
            income += Number(tx.amount);
          } else {
            expense += Number(tx.amount);
          }
        }
      });

      return {
        name: dayLabel,
        'Thu': income,
        'Chi': expense
      };
    });
  };

  const lineChartData = getLineChartData();
  const pieChartData = getPieChartData();
  const barChartData = getBarChartData();

  const getMonthLabel = (monthStr: string) => {
    const [y, m] = monthStr.split('-');
    return `Tháng ${m}/${y}`;
  };

  // Calculations for KPI in selectedMonth
  const activeMonthTransactions = allTransactions.filter(tx => format(new Date(tx.date), 'yyyy-MM') === selectedMonth);
  const activeMonthIncome = activeMonthTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + Number(tx.amount), 0);
  const activeMonthExpense = activeMonthTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + Number(tx.amount), 0);
  const activeMonthSavings = activeMonthIncome - activeMonthExpense;

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">Báo cáo & Thống kê</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Phân tích số liệu và biểu đồ hóa dòng tiền của bạn
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllData}
            disabled={isLoading}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Năm phân tích:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-semibold"
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl text-emerald-600 dark:text-emerald-450">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Thu nhập {getMonthLabel(selectedMonth)}</span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              +{activeMonthIncome.toLocaleString()} <span className="text-xs font-semibold text-slate-400">TWD</span>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl text-rose-600 dark:text-rose-450">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Chi tiêu {getMonthLabel(selectedMonth)}</span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              -{activeMonthExpense.toLocaleString()} <span className="text-xs font-semibold text-slate-400">TWD</span>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl text-indigo-600 dark:text-indigo-450">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tiết kiệm ròng</span>
            <p className={`text-xl font-extrabold mt-1 ${activeMonthSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-650'}`}>
              {activeMonthSavings.toLocaleString()} <span className="text-xs font-semibold text-slate-400">TWD</span>
            </p>
          </div>
        </div>
      </div>

      {/* LINE CHART: MONTHLY INCOME VS EXPENSE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="mb-6">
          <h3 className="font-bold text-slate-950 dark:text-white text-base">Tổng thu và tổng chi theo tháng</h3>
          <p className="text-xs text-slate-555 dark:text-slate-400 mt-0.5">Biểu đồ so sánh dòng tiền vào và ra theo từng tháng trong năm {selectedYear}</p>
        </div>

        <div className="h-80 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
              <XAxis dataKey="name" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}
                labelStyle={{ fontWeight: 'bold', color: '#1E293B' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" dataKey="Thu nhập" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Chi tiêu" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECONDARY ROW: PIE CHART + BAR CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* PIE CHART: CATEGORY BREAKDOWN (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-950 dark:text-white text-base">Phân bổ chi tiêu</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tỷ lệ chi tiêu theo từng danh mục trong {getMonthLabel(selectedMonth)}</p>
          </div>

          {pieChartData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-600">
              <p className="text-sm font-semibold">Chưa phát sinh chi tiêu</p>
              <p className="text-xs">Không có dữ liệu biểu đồ trong tháng này.</p>
            </div>
          ) : (
            <div className="space-y-6 mt-4">
              <div className="h-56 w-full flex items-center justify-center text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieChartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => `${Number(value).toLocaleString()} TWD`}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Labels Legend */}
              <div className="grid grid-cols-2 gap-3 max-h-32 overflow-y-auto scrollbar-none pr-1">
                {pieChartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[11px] font-semibold text-slate-750 dark:text-slate-350 truncate">{item.name}:</span>
                    <span className="text-[11px] font-extrabold text-slate-900 dark:text-white ml-auto">
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* BAR CHART: DAILY FLOW (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <div>
            <h3 className="font-bold text-slate-950 dark:text-white text-base">Lịch sử dòng tiền</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Biểu đồ thống kê biến động thu/chi hàng ngày trong {getMonthLabel(selectedMonth)}</p>
          </div>

          <div className="h-80 w-full text-xs mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip
                  formatter={(value: any) => `${Number(value).toLocaleString()} TWD`}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px'
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="Thu" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Chi" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
