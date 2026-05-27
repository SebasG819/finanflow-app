alter table public.expenses
add column if not exists payment_status text not null default 'paid',
add column if not exists due_day int,
add column if not exists is_recurring boolean not null default false,
add column if not exists total_amount numeric,
add column if not exists installment_amount numeric,
add column if not exists total_installments int,
add column if not exists current_installment int;

update public.expenses
set type = 'variable'
where type is null;

update public.expenses
set is_recurring = true
where type = 'fixed';

alter table public.expenses
alter column type set default 'variable',
alter column type set not null;

alter table public.expenses
drop constraint if exists expenses_type_check,
add constraint expenses_type_check
check (type in ('variable', 'fixed', 'installment'));

alter table public.expenses
drop constraint if exists expenses_payment_status_check,
add constraint expenses_payment_status_check
check (payment_status in ('paid', 'pending'));

alter table public.expenses
drop constraint if exists expenses_due_day_check,
add constraint expenses_due_day_check
check (due_day is null or (due_day between 1 and 31));

alter table public.expenses
drop constraint if exists expenses_installment_totals_check,
add constraint expenses_installment_totals_check
check (
  type <> 'installment'
  or (
    total_installments is not null
    and total_installments > 0
    and current_installment is not null
    and current_installment >= 0
    and current_installment <= total_installments
    and installment_amount is not null
    and installment_amount > 0
    and total_amount is not null
    and total_amount > 0
  )
);
