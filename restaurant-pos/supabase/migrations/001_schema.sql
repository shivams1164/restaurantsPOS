-- FILE: supabase/migrations/001_schema.sql
create extension if not exists pgcrypto;

-- Core helper types
create type public.staff_role as enum ('owner', 'waiter', 'delivery');
create type public.order_status as enum ('pending', 'preparing', 'ready', 'picked', 'delivered', 'cancelled');
create type public.order_type as enum ('dine_in', 'delivery', 'takeaway');

-- Restaurants
create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  address text,
  phone text,
  logo_url text,
  operating_hours jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role public.staff_role not null,
  restaurant_id uuid references public.restaurants(id) on delete set null,
  avatar_url text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Menu
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  category text not null,
  image_url text,
  available boolean not null default true,
  prep_time_min integer not null default 0 check (prep_time_min >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  table_number integer,
  status public.order_status not null default 'pending',
  order_type public.order_type not null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  assigned_delivery_id uuid references public.profiles(id) on delete set null,
  customer_name text,
  customer_address text,
  customer_phone text,
  total_amount numeric(10,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Order items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  price numeric(10,2) not null check (price >= 0),
  notes text,
  created_at timestamptz not null default now()
);

-- Useful indexes
create index if not exists idx_profiles_restaurant_id on public.profiles (restaurant_id);
create index if not exists idx_menu_items_restaurant_id on public.menu_items (restaurant_id);
create index if not exists idx_orders_restaurant_id on public.orders (restaurant_id);
create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_orders_created_by on public.orders (created_by);
create index if not exists idx_orders_assigned_delivery_id on public.orders (assigned_delivery_id);
create index if not exists idx_orders_created_at on public.orders (created_at desc);
create index if not exists idx_order_items_order_id on public.order_items (order_id);

-- Helper functions for RLS
create or replace function public.my_role()
returns public.staff_role
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid() and p.is_active = true
  limit 1;
$$;

create or replace function public.my_restaurant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.restaurant_id
  from public.profiles p
  where p.id = auth.uid() and p.is_active = true
  limit 1;
$$;

revoke all on function public.my_role() from public;
revoke all on function public.my_restaurant_id() from public;
grant execute on function public.my_role() to authenticated;
grant execute on function public.my_restaurant_id() to authenticated;

-- Generic updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger trg_menu_items_updated_at
before update on public.menu_items
for each row execute function public.set_updated_at();

create trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

-- Keep total_amount in sync when order_items change
create or replace function public.recalculate_order_total()
returns trigger
language plpgsql
as $$
declare
  target_order_id uuid;
begin
  target_order_id := coalesce(new.order_id, old.order_id);

  update public.orders o
  set total_amount = coalesce((
    select sum(oi.quantity * oi.price)
    from public.order_items oi
    where oi.order_id = target_order_id
  ), 0),
  updated_at = now()
  where o.id = target_order_id;

  return coalesce(new, old);
end;
$$;

create trigger trg_order_items_recalculate_total
after insert or update or delete on public.order_items
for each row execute function public.recalculate_order_total();

-- Enable RLS
alter table public.restaurants enable row level security;
alter table public.profiles enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Restaurants policies
create policy "owner can view own restaurant"
on public.restaurants
for select
to authenticated
using (owner_id = auth.uid());

create policy "owner can insert own restaurant"
on public.restaurants
for insert
to authenticated
with check (owner_id = auth.uid() and public.my_role() = 'owner');

create policy "owner can update own restaurant"
on public.restaurants
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "owner can delete own restaurant"
on public.restaurants
for delete
to authenticated
using (owner_id = auth.uid());

-- Profiles policies
create policy "user can view own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "owner can view team profiles"
on public.profiles
for select
to authenticated
using (public.my_role() = 'owner' and restaurant_id = public.my_restaurant_id());

create policy "owner can create team profiles"
on public.profiles
for insert
to authenticated
with check (
  public.my_role() = 'owner'
  and restaurant_id = public.my_restaurant_id()
  and role in ('waiter', 'delivery')
);

create policy "owner can update team profiles"
on public.profiles
for update
to authenticated
using (public.my_role() = 'owner' and restaurant_id = public.my_restaurant_id())
with check (
  (
    public.my_role() = 'owner'
    and restaurant_id = public.my_restaurant_id()
  )
  or id = auth.uid()
);

create policy "user can update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "owner can delete team profiles"
on public.profiles
for delete
to authenticated
using (
  public.my_role() = 'owner'
  and restaurant_id = public.my_restaurant_id()
  and role in ('waiter', 'delivery')
);

-- Menu item policies
create policy "owner full menu access"
on public.menu_items
for all
to authenticated
using (public.my_role() = 'owner' and restaurant_id = public.my_restaurant_id())
with check (public.my_role() = 'owner' and restaurant_id = public.my_restaurant_id());

create policy "waiter can read menu"
on public.menu_items
for select
to authenticated
using (public.my_role() = 'waiter' and restaurant_id = public.my_restaurant_id());

create policy "delivery can read menu"
on public.menu_items
for select
to authenticated
using (public.my_role() = 'delivery' and restaurant_id = public.my_restaurant_id());

-- Orders policies
create policy "owner full order access"
on public.orders
for all
to authenticated
using (public.my_role() = 'owner' and restaurant_id = public.my_restaurant_id())
with check (public.my_role() = 'owner' and restaurant_id = public.my_restaurant_id());

create policy "waiter can create orders"
on public.orders
for insert
to authenticated
with check (
  public.my_role() = 'waiter'
  and created_by = auth.uid()
  and restaurant_id = public.my_restaurant_id()
);

create policy "waiter can read own orders"
on public.orders
for select
to authenticated
using (
  public.my_role() = 'waiter'
  and created_by = auth.uid()
  and restaurant_id = public.my_restaurant_id()
);

create policy "delivery can read assigned orders"
on public.orders
for select
to authenticated
using (
  public.my_role() = 'delivery'
  and assigned_delivery_id = auth.uid()
  and restaurant_id = public.my_restaurant_id()
);

create policy "delivery can update assigned status"
on public.orders
for update
to authenticated
using (
  public.my_role() = 'delivery'
  and assigned_delivery_id = auth.uid()
  and restaurant_id = public.my_restaurant_id()
)
with check (
  public.my_role() = 'delivery'
  and assigned_delivery_id = auth.uid()
  and restaurant_id = public.my_restaurant_id()
  and status in ('ready', 'picked', 'delivered')
);

-- Order items policies
create policy "owner full order item access"
on public.order_items
for all
to authenticated
using (
  public.my_role() = 'owner'
  and exists (
    select 1
    from public.orders o
    where o.id = order_id and o.restaurant_id = public.my_restaurant_id()
  )
)
with check (
  public.my_role() = 'owner'
  and exists (
    select 1
    from public.orders o
    where o.id = order_id and o.restaurant_id = public.my_restaurant_id()
  )
);

create policy "waiter can insert order items for own orders"
on public.order_items
for insert
to authenticated
with check (
  public.my_role() = 'waiter'
  and exists (
    select 1
    from public.orders o
    where o.id = order_id
      and o.created_by = auth.uid()
      and o.restaurant_id = public.my_restaurant_id()
  )
);

create policy "waiter can read order items for own orders"
on public.order_items
for select
to authenticated
using (
  public.my_role() = 'waiter'
  and exists (
    select 1
    from public.orders o
    where o.id = order_id
      and o.created_by = auth.uid()
      and o.restaurant_id = public.my_restaurant_id()
  )
);

create policy "delivery can read assigned order items"
on public.order_items
for select
to authenticated
using (
  public.my_role() = 'delivery'
  and exists (
    select 1
    from public.orders o
    where o.id = order_id
      and o.assigned_delivery_id = auth.uid()
      and o.restaurant_id = public.my_restaurant_id()
  )
);

-- Realtime publication for live order updates
alter publication supabase_realtime add table public.orders;
