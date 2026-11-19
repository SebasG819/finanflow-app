create table public.gmail_imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message_id text not null,
  sender text not null,
  subject text not null,
  title text not null,
  amount numeric,
  kind text check (kind in ('expense', 'income')),
  message_date date not null,
  status text not null default 'pending' check (status in ('pending', 'saved', 'discarded')),
  transaction_id uuid,
  created_at timestamptz not null default now(),
  unique (user_id, message_id),
  check (amount is null or amount > 0)
);

create table public.gmail_sender_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sender text not null,
  auto_save boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, sender)
);

create index gmail_imports_pending_idx on public.gmail_imports (user_id, created_at desc) where status = 'pending';
create index gmail_imports_user_date_idx on public.gmail_imports (user_id, message_date desc);

alter table public.gmail_imports enable row level security;
alter table public.gmail_sender_rules enable row level security;

grant select, insert, update, delete on public.gmail_imports to authenticated;
grant select, insert, update, delete on public.gmail_sender_rules to authenticated;

create policy "gmail_imports_select_own" on public.gmail_imports for select to authenticated
using ((select auth.uid()) = user_id);
create policy "gmail_imports_insert_own" on public.gmail_imports for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "gmail_imports_update_own" on public.gmail_imports for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "gmail_imports_delete_own" on public.gmail_imports for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "gmail_sender_rules_select_own" on public.gmail_sender_rules for select to authenticated
using ((select auth.uid()) = user_id);
create policy "gmail_sender_rules_insert_own" on public.gmail_sender_rules for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "gmail_sender_rules_update_own" on public.gmail_sender_rules for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "gmail_sender_rules_delete_own" on public.gmail_sender_rules for delete to authenticated
using ((select auth.uid()) = user_id);

create function public.save_gmail_import(
  p_import_id uuid,
  p_title text,
  p_amount numeric,
  p_kind text,
  p_category text
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_import public.gmail_imports%rowtype;
  v_transaction_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;
  if nullif(trim(p_title), '') is null or p_amount is null or p_amount <= 0
     or nullif(trim(p_category), '') is null or p_kind is null or p_kind not in ('expense', 'income') then
    raise exception 'Invalid transaction details';
  end if;

  select * into v_import from public.gmail_imports
  where id = p_import_id and user_id = (select auth.uid())
  for update;

  if not found or v_import.status <> 'pending' then
    raise exception 'Import is missing or already processed';
  end if;

  if p_kind = 'expense' then
    insert into public.expenses (user_id, title, amount, category, date, description, type, payment_status)
    values (v_import.user_id, trim(p_title), p_amount, trim(p_category), v_import.message_date,
            'Importado desde Gmail', 'variable', 'paid')
    returning id into v_transaction_id;
  else
    insert into public.incomes (user_id, title, amount, source, date, description)
    values (v_import.user_id, trim(p_title), p_amount, trim(p_category), v_import.message_date,
            'Importado desde Gmail')
    returning id into v_transaction_id;
  end if;

  update public.gmail_imports
  set title = trim(p_title), amount = p_amount, kind = p_kind,
      status = 'saved', transaction_id = v_transaction_id
  where id = v_import.id;

  return v_transaction_id;
end;
$$;

revoke all on function public.save_gmail_import(uuid, text, numeric, text, text) from public;
revoke all on function public.save_gmail_import(uuid, text, numeric, text, text) from anon;
grant execute on function public.save_gmail_import(uuid, text, numeric, text, text) to authenticated;
