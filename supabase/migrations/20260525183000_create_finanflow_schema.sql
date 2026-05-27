create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  amount numeric not null,
  category text not null,
  date date not null,
  description text,
  type text check (type in ('fixed', 'variable')),
  created_at timestamptz not null default now()
);

create table if not exists public.incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  amount numeric not null,
  source text not null,
  date date not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  target numeric not null,
  current numeric default 0,
  deadline date,
  category text,
  created_at timestamptz not null default now()
);

create index if not exists expenses_user_id_created_at_idx on public.expenses(user_id, created_at desc);
create index if not exists incomes_user_id_created_at_idx on public.incomes(user_id, created_at desc);
create index if not exists goals_user_id_created_at_idx on public.goals(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.expenses enable row level security;
alter table public.incomes enable row level security;
alter table public.goals enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.expenses to authenticated;
grant select, insert, update, delete on public.incomes to authenticated;
grant select, insert, update, delete on public.goals to authenticated;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "profiles_delete_own"
on public.profiles for delete
to authenticated
using (auth.uid() = id);

create policy "expenses_select_own"
on public.expenses for select
to authenticated
using (auth.uid() = user_id);

create policy "expenses_insert_own"
on public.expenses for insert
to authenticated
with check (auth.uid() = user_id);

create policy "expenses_update_own"
on public.expenses for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "expenses_delete_own"
on public.expenses for delete
to authenticated
using (auth.uid() = user_id);

create policy "incomes_select_own"
on public.incomes for select
to authenticated
using (auth.uid() = user_id);

create policy "incomes_insert_own"
on public.incomes for insert
to authenticated
with check (auth.uid() = user_id);

create policy "incomes_update_own"
on public.incomes for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "incomes_delete_own"
on public.incomes for delete
to authenticated
using (auth.uid() = user_id);

create policy "goals_select_own"
on public.goals for select
to authenticated
using (auth.uid() = user_id);

create policy "goals_insert_own"
on public.goals for insert
to authenticated
with check (auth.uid() = user_id);

create policy "goals_update_own"
on public.goals for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "goals_delete_own"
on public.goals for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do update
  set full_name = excluded.full_name,
      email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;
revoke execute on function public.handle_new_user() from public;
