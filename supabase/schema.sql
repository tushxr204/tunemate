-- =====================================================================
-- Tunemate database schema for Supabase
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- It is safe to run more than once.
-- =====================================================================

-- ---------- Profiles: one row per user ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 30),
  emoji       text not null default '🎧' check (char_length(emoji) <= 8),
  color       int  not null default 0 check (color between 0 and 5),
  bio         text not null default '' check (char_length(bio) <= 160),
  anthem      text not null default '' check (char_length(anthem) <= 60),
  insta       text not null default '' check (insta ~ '^[A-Za-z0-9._]{0,30}$'),
  spotify     text not null default '' check (spotify ~ '^[A-Za-z0-9._-]{0,64}$'),
  genres      text[] not null default '{}' check (coalesce(array_length(genres, 1), 0) <= 12),
  artists     text[] not null default '{}' check (coalesce(array_length(artists, 1), 0) <= 10),
  moods       text[] not null default '{}' check (coalesce(array_length(moods, 1), 0) <= 10),
  energy      int  not null default 50 check (energy between 0 and 100),
  discovery   int  not null default 50 check (discovery between 0 and 100),
  liked       jsonb not null default '[]' check (jsonb_typeof(liked) = 'array' and pg_column_size(liked) < 80000),
  scores      jsonb not null default '{}' check (jsonb_typeof(scores) = 'object' and pg_column_size(scores) < 2000),
  beat        jsonb check (beat is null or pg_column_size(beat) < 2000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: signed-in users can read" on public.profiles;
create policy "profiles: signed-in users can read" on public.profiles
  for select to authenticated using (true);

drop policy if exists "profiles: create your own" on public.profiles;
create policy "profiles: create your own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists "profiles: edit your own" on public.profiles;
create policy "profiles: edit your own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles: delete your own" on public.profiles;
create policy "profiles: delete your own" on public.profiles
  for delete to authenticated using (auth.uid() = id);

-- ---------- Connections: "A wants to connect with B". Two rows = friends ----------
create table if not exists public.connections (
  from_id    uuid not null references public.profiles(id) on delete cascade,
  to_id      uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (from_id, to_id),
  check (from_id <> to_id)
);

alter table public.connections enable row level security;

drop policy if exists "connections: see ones involving you" on public.connections;
create policy "connections: see ones involving you" on public.connections
  for select to authenticated using (auth.uid() = from_id or auth.uid() = to_id);

drop policy if exists "connections: send your own" on public.connections;
create policy "connections: send your own" on public.connections
  for insert to authenticated with check (auth.uid() = from_id);

drop policy if exists "connections: cancel your own" on public.connections;
create policy "connections: cancel your own" on public.connections
  for delete to authenticated using (auth.uid() = from_id);

-- ---------- Blocks ----------
create table if not exists public.blocks (
  blocker    uuid not null references public.profiles(id) on delete cascade,
  blocked    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker, blocked),
  check (blocker <> blocked)
);

alter table public.blocks enable row level security;

drop policy if exists "blocks: see your own" on public.blocks;
create policy "blocks: see your own" on public.blocks
  for select to authenticated using (auth.uid() = blocker);

drop policy if exists "blocks: add your own" on public.blocks;
create policy "blocks: add your own" on public.blocks
  for insert to authenticated with check (auth.uid() = blocker);

drop policy if exists "blocks: remove your own" on public.blocks;
create policy "blocks: remove your own" on public.blocks
  for delete to authenticated using (auth.uid() = blocker);

-- Only mutual connections that haven't blocked each other may message.
create or replace function public.can_message(a uuid, b uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from connections where from_id = a and to_id = b)
     and exists (select 1 from connections where from_id = b and to_id = a)
     and not exists (select 1 from blocks where (blocker = a and blocked = b) or (blocker = b and blocked = a));
$$;

-- ---------- Messages: private 1-to-1 chat ----------
create table if not exists public.messages (
  id         bigint generated always as identity primary key,
  from_id    uuid not null references public.profiles(id) on delete cascade,
  to_id      uuid not null references public.profiles(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 600),
  created_at timestamptz not null default now()
);
create index if not exists messages_to_idx   on public.messages (to_id, created_at desc);
create index if not exists messages_from_idx on public.messages (from_id, created_at desc);

alter table public.messages enable row level security;

drop policy if exists "messages: read your own chats" on public.messages;
create policy "messages: read your own chats" on public.messages
  for select to authenticated using (auth.uid() = from_id or auth.uid() = to_id);

drop policy if exists "messages: send to friends" on public.messages;
create policy "messages: send to friends" on public.messages
  for insert to authenticated with check (auth.uid() = from_id and public.can_message(from_id, to_id));

drop policy if exists "messages: delete what you sent" on public.messages;
create policy "messages: delete what you sent" on public.messages
  for delete to authenticated using (auth.uid() = from_id);

-- ---------- Keep updated_at fresh ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------- Live updates (Realtime) ----------
do $$
begin
  begin alter publication supabase_realtime add table public.profiles;    exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.connections; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.messages;    exception when duplicate_object then null; end;
end $$;
