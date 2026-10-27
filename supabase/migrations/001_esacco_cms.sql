-- E-SACCO CMS schema for Supabase
-- Run this file in the Supabase SQL Editor for a new project.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'member' check (role in ('member', 'cms_admin', 'super_admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null,
  price numeric(14,2) not null default 0 check (price >= 0),
  deposit numeric(14,2) not null default 0 check (deposit >= 0),
  installment numeric(14,2) not null default 0 check (installment >= 0),
  capacity text not null default '',
  power_rating text not null default '',
  warranty text not null default '',
  description text not null default '',
  image_url text not null default '',
  payment_url text not null default '' check (payment_url = '' or payment_url like 'https://%'),
  featured boolean not null default false,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id text primary key,
  title text not null,
  body text not null default '',
  level text not null default 'info' check (level in ('info', 'success', 'warning')),
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_handoffs (
  id uuid primary key default gen_random_uuid(),
  product_id text references public.products(id) on delete set null,
  member_id uuid references auth.users(id) on delete set null,
  event_suite_reference text,
  status text not null default 'initiated' check (status in ('initiated', 'verified', 'failed', 'cancelled')),
  amount numeric(14,2),
  created_at timestamptz not null default now(),
  verified_at timestamptz
);

create or replace function public.is_cms_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('cms_admin', 'super_admin')
  );
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
for each row execute procedure public.set_updated_at();

drop trigger if exists announcements_set_updated_at on public.announcements;
create trigger announcements_set_updated_at before update on public.announcements
for each row execute procedure public.set_updated_at();

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at before update on public.site_settings
for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.announcements enable row level security;
alter table public.site_settings enable row level security;
alter table public.payment_handoffs enable row level security;

drop policy if exists "Profile owners can read their profile" on public.profiles;
create policy "Profile owners can read their profile" on public.profiles
for select using (id = auth.uid() or public.is_cms_admin());

drop policy if exists "Public can read published products" on public.products;
create policy "Public can read published products" on public.products
for select using (active or public.is_cms_admin());
drop policy if exists "CMS admins manage products" on public.products;
create policy "CMS admins manage products" on public.products
for all using (public.is_cms_admin()) with check (public.is_cms_admin());

drop policy if exists "Public can read active announcements" on public.announcements;
create policy "Public can read active announcements" on public.announcements
for select using (active or public.is_cms_admin());
drop policy if exists "CMS admins manage announcements" on public.announcements;
create policy "CMS admins manage announcements" on public.announcements
for all using (public.is_cms_admin()) with check (public.is_cms_admin());

drop policy if exists "Public can read settings" on public.site_settings;
create policy "Public can read settings" on public.site_settings
for select using (true);
drop policy if exists "CMS admins manage settings" on public.site_settings;
create policy "CMS admins manage settings" on public.site_settings
for all using (public.is_cms_admin()) with check (public.is_cms_admin());

drop policy if exists "Members see own payment handoffs" on public.payment_handoffs;
create policy "Members see own payment handoffs" on public.payment_handoffs
for select using (member_id = auth.uid() or public.is_cms_admin());
drop policy if exists "CMS admins manage payment handoffs" on public.payment_handoffs;
create policy "CMS admins manage payment handoffs" on public.payment_handoffs
for all using (public.is_cms_admin()) with check (public.is_cms_admin());

insert into public.site_settings (id, content) values (
  'main',
  '{"heroTitle":"Own a cleaner way to cook","heroSubtitle":"Save consistently, access responsible credit through Zimba SACCO and purchase approved electric-cooking appliances.","supportPhone":"+256 700 000 000","supportEmail":"support@example.org","defaultPaymentUrl":"https://events.vermaak.africa"}'::jsonb
) on conflict (id) do nothing;

insert into public.products (id, name, category, price, deposit, installment, capacity, power_rating, warranty, description, image_url, payment_url, featured, active) values
('epc-6l', 'Electric Pressure Cooker', 'Cookers', 850000, 170000, 75000, '6 litres', '1,000 W', '12 months', 'Fast, efficient pressure cooking for households and small food businesses.', 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=900&q=80', 'https://events.vermaak.africa', true, true),
('induction-2kw', 'Induction Cooker', 'Cookers', 420000, 84000, 42000, 'Single plate', '2,000 W', '12 months', 'Responsive countertop cooking with precise heat control and an easy-clean surface.', 'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=900&q=80', 'https://events.vermaak.africa', true, true),
('kettle-17l', 'Electric Kettle', 'Small appliances', 120000, 24000, 24000, '1.7 litres', '1,500 W', '6 months', 'A durable electric kettle for fast boiling at home, work or a small business.', 'https://images.unsplash.com/photo-1594213114663-d94db9b17125?auto=format&fit=crop&w=900&q=80', 'https://events.vermaak.africa', false, true)
on conflict (id) do nothing;

insert into public.announcements (id, title, body, level, active) values
('a1', 'Save towards clean cooking', 'Make a contribution today and move closer to your appliance goal.', 'info', true),
('a2', 'Responsible finance', 'All final credit decisions and terms are approved by Zimba SACCO.', 'success', true)
on conflict (id) do nothing;

-- After creating an administrator in Supabase Authentication, grant CMS access:
-- insert into public.profiles (id, full_name, role)
-- values ('AUTH-USER-UUID', 'Administrator Name', 'cms_admin')
-- on conflict (id) do update set role = excluded.role;
