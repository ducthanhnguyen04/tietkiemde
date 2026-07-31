-- Supabase Database Schema for Personal Expense Tracker

-- 1. ENABLE EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. CREATE TABLES

-- Categories Table
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  icon text not null, -- E.g. emoji or icon identifier
  color text not null, -- Tailwind-friendly hex or color name (e.g. "#10B981")
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint categories_name_user_unique unique(user_id, name)
);

-- Transactions Table
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(15, 2) not null check (amount > 0),
  description text,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Budgets Table
create table public.budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  month text not null, -- Format: YYYY-MM
  limit_amount numeric(15, 2) not null check (limit_amount >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint budgets_user_category_month_unique unique(user_id, category_id, month)
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

-- 4. ROW LEVEL SECURITY POLICIES

-- Policies for Categories
create policy "Users can perform all operations on their own categories"
on public.categories for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Policies for Transactions
create policy "Users can perform all operations on their own transactions"
on public.transactions for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Policies for Budgets
create policy "Users can perform all operations on their own budgets"
on public.budgets for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- 5. PERFORMANCE INDEXES
create index idx_categories_user_id on public.categories(user_id);
create index idx_transactions_user_id on public.transactions(user_id);
create index idx_transactions_date on public.transactions(date);
create index idx_budgets_user_id_month on public.budgets(user_id, month);

-- 6. SAVINGS TABLE & POLICIES
create table public.savings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(12,2) not null check (amount > 0),
  description text not null,
  date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.savings enable row level security;

-- Policies for Savings
create policy "Users can perform all operations on their own savings"
on public.savings for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Performance Indexes for Savings
create index idx_savings_user_id on public.savings(user_id);
create index idx_savings_date on public.savings(date);
