create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  city text not null,
  discipline_score integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  opponent_type text not null check (opponent_type in ('ai', 'human')),
  opponent_name text not null,
  result text not null check (result in ('win', 'loss', 'draw')),
  pgn text not null,
  final_fen text not null,
  accuracy numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.game_reviews (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  accuracy numeric,
  discipline_score_delta integer,
  notes text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, city)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'username', ''), split_part(new.email, '@', 1)),
    coalesce(nullif(new.raw_user_meta_data->>'city', ''), 'Unknown')
  )
  on conflict (id) do update
    set
      username = excluded.username,
      city = excluded.city,
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.game_reviews enable row level security;

drop policy if exists "Profiles are readable" on public.profiles;
drop policy if exists "Users can create their profile" on public.profiles;
drop policy if exists "Users can update their profile" on public.profiles;
drop policy if exists "Games are readable" on public.games;
drop policy if exists "Users can save their games" on public.games;
drop policy if exists "Users can update their games" on public.games;
drop policy if exists "Reviews are readable" on public.game_reviews;
drop policy if exists "Users can create their reviews" on public.game_reviews;
drop policy if exists "Users can update their reviews" on public.game_reviews;

create policy "Profiles are readable"
  on public.profiles for select
  using (true);

create policy "Users can create their profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Games are readable"
  on public.games for select
  using (true);

create policy "Users can save their games"
  on public.games for insert
  with check (auth.uid() = user_id);

create policy "Users can update their games"
  on public.games for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Reviews are readable"
  on public.game_reviews for select
  using (true);

create policy "Users can create their reviews"
  on public.game_reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update their reviews"
  on public.game_reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
