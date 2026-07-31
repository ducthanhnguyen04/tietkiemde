import { create } from 'zustand';
import { dbService } from '../services/db';
import { authService } from '../services/auth';
import type { Category, Transaction, Budget, Saving } from '../types';
import { format } from 'date-fns';

interface FinanceState {
  user: any | null;
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  savings: Saving[];
  selectedMonth: string; // YYYY-MM
  filters: {
    search: string;
    categoryId: string;
  };
  isLoading: boolean;
  isAuthLoading: boolean;
  error: string | null;
  
  // Auth Actions
  setUser: (user: any) => void;
  checkSession: () => Promise<void>;
  signOut: () => Promise<void>;
  
  // UI Selection Actions
  setSelectedMonth: (month: string) => void;
  setFilters: (filters: Partial<{ search: string; categoryId: string }>) => void;
  
  // Data Fetching Actions
  fetchInitialData: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchBudgets: () => Promise<void>;
  
  // Category Actions
  addCategory: (category: Omit<Category, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  editCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Transaction Actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  editTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  // Budget Actions
  upsertBudget: (categoryId: string, limitAmount: number) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  
  // Saving Actions
  fetchSavings: () => Promise<void>;
  addSaving: (saving: Omit<Saving, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  deleteSaving: (id: string) => Promise<void>;
  
  // Selectors/Computed Helpers
  getMetrics: () => { balance: number; totalIncome: number; totalExpense: number; totalSavings: number };
  getCategoryExpenses: () => { [categoryId: string]: number };
  getBudgetUsage: () => Array<{
    budget: Budget;
    spent: number;
    percent: number;
    exceeded: boolean;
    overAmount: number;
  }>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  user: null,
  categories: [],
  transactions: [],
  budgets: [],
  savings: [],
  selectedMonth: format(new Date(), 'yyyy-MM'),
  filters: {
    search: '',
    categoryId: '',
  },
  isLoading: false,
  isAuthLoading: true,
  error: null,

  // ==========================================
  // AUTH ACTIONS
  // ==========================================
  
  setUser: (user) => set({ user }),
  
  checkSession: async () => {
    set({ isAuthLoading: true });
    try {
      const user = await authService.getCurrentUser();
      set({ user, isAuthLoading: false });
      if (user) {
        // Fetch data immediately upon session confirmation
        await get().fetchInitialData();
      }
    } catch (err: any) {
      set({ user: null, isAuthLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await authService.signOut();
      set({
        user: null,
        categories: [],
        transactions: [],
        budgets: [],
        savings: [],
        error: null
      });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  // ==========================================
  // UI ACTIONS
  // ==========================================
  
  setSelectedMonth: (month) => {
    set({ selectedMonth: month });
    // Fetch data for the new month selection
    get().fetchTransactions();
    get().fetchBudgets();
    get().fetchSavings();
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  // ==========================================
  // DATA FETCHING ACTIONS
  // ==========================================
  
  fetchInitialData: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch categories first, as transactions and budgets depend on them
      const categories = await dbService.getCategories();
      set({ categories });
      
      // Concurrently fetch transactions, budgets and savings for the current selectedMonth
      const [transactions, budgets, savings] = await Promise.all([
        dbService.getTransactions({ month: get().selectedMonth }),
        dbService.getBudgets(get().selectedMonth),
        dbService.getSavings(get().selectedMonth),
      ]);
      
      set({ transactions, budgets, savings, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await dbService.getCategories();
      set({ categories });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchTransactions: async () => {
    set({ isLoading: true });
    try {
      const transactions = await dbService.getTransactions({
        month: get().selectedMonth,
      });
      set({ transactions, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchBudgets: async () => {
    try {
      const budgets = await dbService.getBudgets(get().selectedMonth);
      set({ budgets });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  // ==========================================
  // CATEGORY ACTIONS
  // ==========================================
  
  addCategory: async (categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const newCategory = await dbService.createCategory(categoryData);
      set((state) => ({
        categories: [...state.categories, newCategory],
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  editCategory: async (id, categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedCategory = await dbService.updateCategory(id, categoryData);
      
      // Update categories list locally
      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? updatedCategory : c)),
        // If categories in transactions list have changed, update them too
        transactions: state.transactions.map((t) =>
          t.category_id === id ? { ...t, category: updatedCategory } : t
        ),
        // Update budget list's local category details
        budgets: state.budgets.map((b) =>
          b.category_id === id ? { ...b, category: updatedCategory } : b
        )
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await dbService.deleteCategory(id);
      
      // Remove from categories list, and update related fields
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        transactions: state.transactions.map((t) =>
          t.category_id === id ? { ...t, category_id: null, category: undefined } : t
        ),
        budgets: state.budgets.filter((b) => b.category_id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // ==========================================
  // TRANSACTION ACTIONS
  // ==========================================
  
  addTransaction: async (transactionData) => {
    set({ isLoading: true, error: null });
    try {
      const newTransaction = await dbService.createTransaction(transactionData);
      
      // Only append to lists if the transaction date matches the current month selected
      const transactionMonth = format(new Date(transactionData.date), 'yyyy-MM');
      if (transactionMonth === get().selectedMonth) {
        set((state) => ({
          transactions: [newTransaction, ...state.transactions].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          ),
        }));
      }
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  editTransaction: async (id, transactionData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTransaction = await dbService.updateTransaction(id, transactionData);
      const originalMonth = get().selectedMonth;
      
      if (transactionData.date) {
        const transactionMonth = format(new Date(transactionData.date), 'yyyy-MM');
        if (transactionMonth !== originalMonth) {
          // If transaction month was changed to a different month, remove it from list
          set((state) => ({
            transactions: state.transactions.filter((t) => t.id !== id),
          }));
          return;
        }
      }

      set((state) => ({
        transactions: state.transactions
          .map((t) => (t.id === id ? updatedTransaction : t))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await dbService.deleteTransaction(id);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // ==========================================
  // BUDGET ACTIONS
  // ==========================================
  
  upsertBudget: async (categoryId, limitAmount) => {
    set({ isLoading: true, error: null });
    try {
      const activeMonth = get().selectedMonth;
      const updatedBudget = await dbService.upsertBudget({
        category_id: categoryId,
        month: activeMonth,
        limit_amount: limitAmount,
      });

      set((state) => {
        const exists = state.budgets.some((b) => b.category_id === categoryId);
        if (exists) {
          return {
            budgets: state.budgets.map((b) => (b.category_id === categoryId ? updatedBudget : b)),
          };
        } else {
          return {
            budgets: [...state.budgets, updatedBudget],
          };
        }
      });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteBudget: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await dbService.deleteBudget(id);
      set((state) => ({
        budgets: state.budgets.filter((b) => b.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // ==========================================
  // SAVINGS ACTIONS
  // ==========================================

  fetchSavings: async () => {
    try {
      const savings = await dbService.getSavings(get().selectedMonth);
      set({ savings });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  addSaving: async (savingData) => {
    set({ isLoading: true, error: null });
    try {
      const newSaving = await dbService.createSaving(savingData);
      const savingMonth = format(new Date(savingData.date), 'yyyy-MM');
      if (savingMonth === get().selectedMonth) {
        set((state) => ({
          savings: [newSaving, ...state.savings].sort(
            (a, b) => b.date.localeCompare(a.date)
          ),
        }));
      }
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSaving: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await dbService.deleteSaving(id);
      set((state) => ({
        savings: state.savings.filter((s) => s.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // ==========================================
  // SELECTORS / COMPUTED PROPERTIES
  // ==========================================
  
  getMetrics: () => {
    const transactions = get().transactions;
    const savings = get().savings;
    let totalIncome = 0;
    let totalExpense = 0;
    let totalSavings = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += Number(tx.amount);
      } else {
        totalExpense += Number(tx.amount);
      }
    });

    savings.forEach((s) => {
      totalSavings += Number(s.amount);
    });

    // Available Balance = Income - Expense - Savings
    const balance = totalIncome - totalExpense - totalSavings;
    return { balance, totalIncome, totalExpense, totalSavings };
  },

  getCategoryExpenses: () => {
    const transactions = get().transactions;
    const expenseMap: { [categoryId: string]: number } = {};

    transactions.forEach((tx) => {
      if (tx.type === 'expense' && tx.category_id) {
        expenseMap[tx.category_id] = (expenseMap[tx.category_id] || 0) + Number(tx.amount);
      }
    });

    return expenseMap;
  },

  getBudgetUsage: () => {
    const budgets = get().budgets;
    const expenses = get().getCategoryExpenses();

    return budgets.map((budget) => {
      const spent = expenses[budget.category_id] || 0;
      const limit = Number(budget.limit_amount);
      const percent = limit > 0 ? (spent / limit) * 100 : 0;
      const exceeded = spent > limit;
      const overAmount = exceeded ? spent - limit : 0;

      return {
        budget,
        spent,
        percent,
        exceeded,
        overAmount,
      };
    });
  },
}));
