-- Clean up existing objects if they exist
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.transactions;
drop table if exists public.profiles;

-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  email text,
  plan_tier text default 'basic' check (plan_tier in ('basic', 'standard', 'premium')),
  stripe_customer_id text,
  stripe_subscription_id text,
  virtual_card_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, plan_tier)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email,
    coalesce(new.raw_user_meta_data->>'selected_plan', 'basic')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Transactions Table
create table if not exists public.transactions (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid references public.profiles(id) on delete cascade not null,
    type text not null check (type in ('deposit', 'withdrawal', 'card_spend', 'crypto_buy', 'crypto_sell', 'transfer')),
    amount numeric not null,
    currency text not null default 'USD',
    description text,
    asset_id text, -- For crypto transactions
    asset_symbol text,
    status text default 'completed',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Transactions
alter table public.transactions enable row level security;

create policy "Users can view their own transactions"
on public.transactions for select
using (auth.uid() = profile_id);

create policy "Users can insert their own transactions"
on public.transactions for insert
with check (auth.uid() = profile_id);

-- Indexes
create index if not exists transactions_profile_id_idx on public.transactions(profile_id);
create index if not exists transactions_created_at_idx on public.transactions(created_at);
