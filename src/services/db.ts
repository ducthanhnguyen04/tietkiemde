import { supabase } from '../supabase/supabaseClient';
import type { Category, Transaction, Budget, Saving } from '../types';

// Default categories to seed for new users
export const DEFAULT_CATEGORIES = [
  { name: 'Ăn uống', icon: '🍔', color: '#F97316' }, // Orange
  { name: 'Di chuyển', icon: '🚗', color: '#3B82F6' }, // Blue
  { name: 'Mua sắm', icon: '🛍️', color: '#EC4899' }, // Pink
  { name: 'Học tập', icon: '📚', color: '#8B5CF6' }, // Purple
  { name: 'Giải trí', icon: '🎮', color: '#10B981' }, // Emerald
  { name: 'Nhà cửa', icon: '🏠', color: '#64748B' }, // Slate
  { name: 'Y tế & Sức khỏe', icon: '💊', color: '#EF4444' }, // Red
  { name: 'Lương', icon: '💵', color: '#22C55E' }, // Green (Income)
  { name: 'Thu nhập khác', icon: '📈', color: '#14B8A6' }, // Teal (Income)
];

export const dbService = {
  // ==========================================
  // CATEGORIES CRUD
  // ==========================================
  
  async getCategories(): Promise<Category[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    
    // If user has no categories, seed default categories automatically
    if (!data || data.length === 0) {
      return await this.seedDefaultCategories(user.id);
    }

    return data as Category[];
  },

  async seedDefaultCategories(userId: string): Promise<Category[]> {
    const categoriesToInsert = DEFAULT_CATEGORIES.map(cat => ({
      user_id: userId,
      name: cat.name,
      icon: cat.icon,
      color: cat.color
    }));

    const { data, error } = await supabase
      .from('categories')
      .insert(categoriesToInsert)
      .select();

    if (error) throw error;
    return data as Category[];
  },

  async createCategory(category: Omit<Category, 'id' | 'user_id' | 'created_at'>): Promise<Category> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('categories')
      .insert({
        ...category,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  },

  async updateCategory(id: string, category: Partial<Omit<Category, 'id' | 'user_id' | 'created_at'>>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ==========================================
  // TRANSACTIONS CRUD
  // ==========================================
  
  async getTransactions(filters?: { month?: string; categoryId?: string; search?: string }): Promise<Transaction[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    
    if (filters?.month) {
      // filters.month is in YYYY-MM format
      const startOfMonth = `${filters.month}-01`;
      
      // Calculate end date correctly (supporting leap years, etc.)
      const [year, month] = filters.month.split('-').map(Number);
      const lastDay = new Date(year, month, 0).getDate();
      const endOfMonth = `${filters.month}-${String(lastDay).padStart(2, '0')}`;
      
      query = query.gte('date', startOfMonth).lte('date', endOfMonth);
    }

    if (filters?.search) {
      query = query.ilike('description', `%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Transaction[];
  },

  async createTransaction(transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Promise<Transaction> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transaction,
        user_id: user.id
      })
      .select('*, category:categories(*)')
      .single();

    if (error) throw error;
    return data as Transaction;
  },

  async updateTransaction(id: string, transaction: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update(transaction)
      .eq('id', id)
      .select('*, category:categories(*)')
      .single();

    if (error) throw error;
    return data as Transaction;
  },

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ==========================================
  // BUDGETS CRUD
  // ==========================================
  
  async getBudgets(month?: string): Promise<Budget[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('budgets')
      .select('*, category:categories(*)');

    if (month) {
      query = query.eq('month', month);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Budget[];
  },

  async upsertBudget(budget: { category_id: string; month: string; limit_amount: number }): Promise<Budget> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Attempt to upsert using user_id + category_id + month unique constraint
    const { data, error } = await supabase
      .from('budgets')
      .upsert({
        ...budget,
        user_id: user.id
      }, {
        onConflict: 'user_id,category_id,month'
      })
      .select('*, category:categories(*)')
      .single();

    if (error) throw error;
    return data as Budget;
  },

  async deleteBudget(id: string): Promise<void> {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ==========================================
  // SAVINGS OPERATIONS
  // ==========================================

  async getSavings(month?: string): Promise<Saving[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('savings')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (month) {
      const [yearStr, monthStr] = month.split('-');
      const year = parseInt(yearStr, 10);
      const monthNum = parseInt(monthStr, 10);
      const startDate = `${month}-01`;
      const lastDay = new Date(year, monthNum, 0).getDate();
      const endDate = `${month}-${lastDay < 10 ? '0' + lastDay : lastDay}`;
      query = query.gte('date', startDate).lte('date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Saving[];
  },

  async createSaving(saving: { amount: number; description: string; date: string }): Promise<Saving> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('savings')
      .insert({
        ...saving,
        user_id: user.id
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as Saving;
  },

  async deleteSaving(id: string): Promise<void> {
    const { error } = await supabase
      .from('savings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
