-- Vínculo: Marketplace de Criadores e Agências
-- Schema completo com RLS

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  user_type     text check (user_type in ('creator', 'agency')),
  display_name  text,
  avatar_url    text,
  created_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles: public read" on public.profiles
  for select using (true);

-- ─── USER ROLES ──────────────────────────────────────────────────────────────
create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role    text not null check (role in ('admin', 'user')),
  primary key (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(p_role text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = p_role
  );
$$;

-- Uses SECURITY DEFINER function to avoid infinite recursion when
-- referencing user_roles inside its own RLS policy.
create policy "user_roles: admin only" on public.user_roles
  for all using (public.has_role('admin'));

create policy "user_roles: read own" on public.user_roles
  for select using (auth.uid() = user_id);

-- ─── CREATORS ────────────────────────────────────────────────────────────────
create table if not exists public.creators (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  niche              text,
  sub_niches         text[] not null default '{}',
  platforms          text[] not null default '{}',
  audience_size_range text,
  goals              text[] not null default '{}',
  bio                text,
  created_at         timestamptz not null default now()
);

alter table public.creators enable row level security;

create policy "creators: read own" on public.creators
  for select using (auth.uid() = user_id);

create policy "creators: upsert own" on public.creators
  for insert with check (auth.uid() = user_id);

create policy "creators: update own" on public.creators
  for update using (auth.uid() = user_id);

-- ─── AGENCIES ────────────────────────────────────────────────────────────────
create table if not exists public.agencies (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  slug        text not null unique,
  logo_url    text,
  niches      text[] not null default '{}',
  services    text[] not null default '{}',
  description text,
  website     text,
  featured    boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.agencies enable row level security;

create policy "agencies: public read" on public.agencies
  for select using (true);

create policy "agencies: upsert own" on public.agencies
  for insert with check (auth.uid() = user_id);

create policy "agencies: update own" on public.agencies
  for update using (auth.uid() = user_id);

-- ─── MATCHES ─────────────────────────────────────────────────────────────────
create table if not exists public.matches (
  id          uuid primary key default uuid_generate_v4(),
  creator_id  uuid not null references auth.users(id) on delete cascade,
  agency_id   uuid not null references auth.users(id) on delete cascade,
  score       numeric not null check (score >= 0 and score <= 100),
  reason      text not null default '',
  created_at  timestamptz not null default now(),
  unique (creator_id, agency_id)
);

alter table public.matches enable row level security;

create policy "matches: read own" on public.matches
  for select using (auth.uid() = creator_id or auth.uid() = agency_id);

create policy "matches: insert own" on public.matches
  for insert with check (auth.uid() = creator_id);

create policy "matches: delete own" on public.matches
  for delete using (auth.uid() = creator_id);

-- ─── THREADS ─────────────────────────────────────────────────────────────────
create table if not exists public.threads (
  id              uuid primary key default uuid_generate_v4(),
  creator_id      uuid not null references auth.users(id) on delete cascade,
  agency_id       uuid not null references auth.users(id) on delete cascade,
  created_at      timestamptz not null default now(),
  last_message_at timestamptz,
  unique (creator_id, agency_id)
);

alter table public.threads enable row level security;

create policy "threads: read own" on public.threads
  for select using (auth.uid() = creator_id or auth.uid() = agency_id);

create policy "threads: insert as creator" on public.threads
  for insert with check (auth.uid() = creator_id);

create policy "threads: update own" on public.threads
  for update using (auth.uid() = creator_id or auth.uid() = agency_id);

-- ─── MESSAGES ────────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id         uuid primary key default uuid_generate_v4(),
  thread_id  uuid not null references public.threads(id) on delete cascade,
  sender_id  uuid not null references auth.users(id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "messages: read thread participants" on public.messages
  for select using (
    exists (
      select 1 from public.threads t
      where t.id = thread_id
        and (t.creator_id = auth.uid() or t.agency_id = auth.uid())
    )
  );

create policy "messages: insert as participant" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.threads t
      where t.id = thread_id
        and (t.creator_id = auth.uid() or t.agency_id = auth.uid())
    )
  );

-- ─── DEALS ───────────────────────────────────────────────────────────────────
create table if not exists public.deals (
  id               uuid primary key default uuid_generate_v4(),
  thread_id        uuid not null references public.threads(id) on delete cascade,
  estimated_value  numeric not null default 0,
  commission_rate  numeric not null default 0.1,
  status           text not null default 'pending' check (status in ('pending', 'confirmed', 'paid')),
  created_at       timestamptz not null default now()
);

alter table public.deals enable row level security;

create policy "deals: read thread participants" on public.deals
  for select using (
    exists (
      select 1 from public.threads t
      where t.id = thread_id
        and (t.creator_id = auth.uid() or t.agency_id = auth.uid())
    )
  );

create policy "deals: insert as participant" on public.deals
  for insert with check (
    exists (
      select 1 from public.threads t
      where t.id = thread_id
        and (t.creator_id = auth.uid() or t.agency_id = auth.uid())
    )
  );

-- ─── TRIGGER: auto-create profile on signup ──────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, user_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    (new.raw_user_meta_data->>'user_type')::text
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── REALTIME ────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.threads;

-- ─── SEED: Agências de exemplo ───────────────────────────────────────────────
-- (Run manually after creating test accounts, or insert via dashboard)
-- insert into public.agencies (user_id, name, slug, niches, services, description, featured) values ...
