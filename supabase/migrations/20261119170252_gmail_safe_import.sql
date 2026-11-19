alter table public.gmail_imports
  add column if not exists auto_save_eligible boolean not null default false;
