export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string; // emoji string (e.g. "🍔") or Lucide icon key
  color: string; // hex color or Tailwind color class (e.g. "#EF4444")
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  category?: Category; // joined category metadata
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD format
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  category?: Category; // joined category metadata
  month: string; // YYYY-MM format
  limit_amount: number;
  created_at: string;
}

export interface DashboardMetrics {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
}

export interface Saving {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
  created_at: string;
}
