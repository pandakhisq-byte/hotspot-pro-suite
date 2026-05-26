
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  wallet_balance numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Roles
create type public.app_role as enum ('admin','moderator','user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique(user_id, role)
);
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;
create policy "Users view own roles" on public.user_roles for select using (auth.uid() = user_id);
create policy "Admins manage roles" on public.user_roles for all using (public.has_role(auth.uid(),'admin'));

-- Auto profile + default role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Timestamp trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Packages
create table public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null,
  duration text not null,
  download text not null,
  upload text not null,
  data_limit text not null,
  badge text,
  features jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.packages enable row level security;
create policy "Anyone read active packages" on public.packages for select using (active = true);
create policy "Admins manage packages" on public.packages for all using (public.has_role(auth.uid(),'admin'));

insert into public.packages (name,price,duration,download,upload,data_limit,badge,features,sort_order) values
('Quick Hour',10,'1 Hour','5 Mbps','2 Mbps','500 MB',null,'["Browsing","Social Media","1 Device"]',1),
('Daily Boost',50,'24 Hours','10 Mbps','5 Mbps','2 GB','Popular','["HD Streaming","Video Calls","1 Device"]',2),
('Weekly Pro',200,'7 Days','15 Mbps','8 Mbps','10 GB','Best Value','["4K Streaming","Gaming","2 Devices"]',3),
('Monthly Max',500,'30 Days','25 Mbps','12 Mbps','Unlimited','Unlimited','["Unlimited Data","All Speeds","3 Devices"]',4),
('Night Owl',20,'10pm - 6am','20 Mbps','10 Mbps','Unlimited','Night','["Off-peak hours","Unlimited","1 Device"]',5),
('Weekend Pass',150,'Sat-Sun','15 Mbps','8 Mbps','8 GB',null,'["Fri 6pm - Mon 6am","2 Devices"]',6);

-- Branches
create table public.branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  created_at timestamptz not null default now()
);
alter table public.branches enable row level security;
create policy "Anyone read branches" on public.branches for select using (true);
create policy "Admins manage branches" on public.branches for all using (public.has_role(auth.uid(),'admin'));

-- Routers
create table public.routers (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references public.branches(id) on delete set null,
  name text not null,
  ip text not null,
  status text not null default 'offline',
  cpu int not null default 0,
  ram int not null default 0,
  users int not null default 0,
  bandwidth text not null default '0 Mbps',
  uptime text default '-',
  created_at timestamptz not null default now()
);
alter table public.routers enable row level security;
create policy "Admins read routers" on public.routers for select using (public.has_role(auth.uid(),'admin'));
create policy "Admins manage routers" on public.routers for all using (public.has_role(auth.uid(),'admin'));

-- Transactions
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  package_id uuid references public.packages(id) on delete set null,
  phone text not null,
  amount numeric not null,
  mpesa_receipt text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
alter table public.transactions enable row level security;
create policy "Users view own tx" on public.transactions for select using (auth.uid() = user_id);
create policy "Admins view all tx" on public.transactions for select using (public.has_role(auth.uid(),'admin'));
create policy "Anyone create tx" on public.transactions for insert with check (true);

-- Devices
create table public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  mac text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.devices enable row level security;
create policy "Users manage own devices" on public.devices for all using (auth.uid() = user_id);
