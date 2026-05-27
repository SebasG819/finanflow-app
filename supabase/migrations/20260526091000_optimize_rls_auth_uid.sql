drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_delete_own" on public.profiles;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "profiles_delete_own"
on public.profiles for delete
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "expenses_select_own" on public.expenses;
drop policy if exists "expenses_insert_own" on public.expenses;
drop policy if exists "expenses_update_own" on public.expenses;
drop policy if exists "expenses_delete_own" on public.expenses;

create policy "expenses_select_own"
on public.expenses for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "expenses_insert_own"
on public.expenses for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "expenses_update_own"
on public.expenses for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "expenses_delete_own"
on public.expenses for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "incomes_select_own" on public.incomes;
drop policy if exists "incomes_insert_own" on public.incomes;
drop policy if exists "incomes_update_own" on public.incomes;
drop policy if exists "incomes_delete_own" on public.incomes;

create policy "incomes_select_own"
on public.incomes for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "incomes_insert_own"
on public.incomes for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "incomes_update_own"
on public.incomes for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "incomes_delete_own"
on public.incomes for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "goals_select_own" on public.goals;
drop policy if exists "goals_insert_own" on public.goals;
drop policy if exists "goals_update_own" on public.goals;
drop policy if exists "goals_delete_own" on public.goals;

create policy "goals_select_own"
on public.goals for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "goals_insert_own"
on public.goals for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "goals_update_own"
on public.goals for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "goals_delete_own"
on public.goals for delete
to authenticated
using ((select auth.uid()) = user_id);
