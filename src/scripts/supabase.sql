-- Enable required extension
create extension if not exists "pgcrypto";

-- profiles (optional)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  created_at timestamptz default now()
);

-- Common columns per table: id, user_id, created_at, updated_at
-- SETTINGS: one row per user
create table if not exists settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Customers
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text, phone text,
  billing_address jsonb, shipping_address jsonb,
  tax_id text, notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Items
create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sku text, name text not null, description text,
  stock_qty numeric, unit_price numeric not null, purchase_price numeric,
  tax_rate numeric, category text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

-- Invoices
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  number text not null,
  customer_id uuid,
  customer_name text,
  customer_tax_id text,
  date date, due_date date, status text,
  lines jsonb, subtotal numeric, tax_total numeric, discount numeric, total numeric,
  notes text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

-- Purchases
create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vendor text not null, date date, due_date date, category text,
  lines jsonb, total numeric, status text, notes text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

-- Payments
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date, type text check (type in ('in','out')),
  amount numeric not null, method text,
  invoice_id uuid, purchase_id uuid,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

-- Update triggers
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;

do $$
begin
  perform 1 from pg_trigger where tgname = 'set_updated_at_customers';
  if not found then
    create trigger set_updated_at_customers before update on customers for each row execute procedure set_updated_at();
    create trigger set_updated_at_items before update on items for each row execute procedure set_updated_at();
    create trigger set_updated_at_invoices before update on invoices for each row execute procedure set_updated_at();
    create trigger set_updated_at_purchases before update on purchases for each row execute procedure set_updated_at();
    create trigger set_updated_at_payments before update on payments for each row execute procedure set_updated_at();
    create trigger set_updated_at_settings before update on settings for each row execute procedure set_updated_at();
  end if;
end$$;

-- RLS
alter table customers enable row level security;
alter table items enable row level security;
alter table invoices enable row level security;
alter table purchases enable row level security;
alter table payments enable row level security;
alter table settings enable row level security;

create policy "user can read own" on customers for select using (auth.uid() = user_id);
create policy "user can crud own" on customers for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user can read own" on items for select using (auth.uid() = user_id);
create policy "user can crud own" on items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user can read own" on invoices for select using (auth.uid() = user_id);
create policy "user can crud own" on invoices for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user can read own" on purchases for select using (auth.uid() = user_id);
create policy "user can crud own" on purchases for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user can read own" on payments for select using (auth.uid() = user_id);
create policy "user can crud own" on payments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user can read own" on settings for select using (auth.uid() = user_id);
create policy "user can upsert own" on settings for insert with check (auth.uid() = user_id);
create policy "user can update own" on settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);