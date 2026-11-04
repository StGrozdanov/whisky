-- Identity: Customer Accounts and the single Shopkeeper, both on top of
-- Supabase Auth logins (auth.users). A login is a Customer Account or the
-- Shopkeeper, never both. Read and written by the server only (service
-- role); RLS stays on with no public policies.

-- Customer Account: registration requires first and last name.
create table customer_accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  created_at timestamptz not null default now(),
  constraint customer_accounts_first_name_present check (length(btrim(first_name)) between 1 and 80),
  constraint customer_accounts_last_name_present check (length(btrim(last_name)) between 1 and 80)
);

alter table customer_accounts enable row level security;

-- Shopkeeper: exactly one login may open the back office. It is created by
-- hand in Supabase Auth and then inserted here; there is no sign-up.
create table shopkeepers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  only_one boolean not null default true unique,
  constraint shopkeepers_only_one check (only_one)
);

alter table shopkeepers enable row level security;

create function identity_kinds_stay_separate() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_table_name = 'customer_accounts'
    and exists (select 1 from public.shopkeepers where user_id = new.user_id) then
    raise exception 'The Shopkeeper login cannot hold a Customer Account';
  end if;
  if tg_table_name = 'shopkeepers'
    and exists (select 1 from public.customer_accounts where user_id = new.user_id) then
    raise exception 'A Customer Account login cannot be the Shopkeeper';
  end if;
  return new;
end;
$$;

create trigger customer_accounts_not_shopkeeper
  before insert or update of user_id on customer_accounts
  for each row execute function identity_kinds_stay_separate();

create trigger shopkeepers_not_customer
  before insert or update of user_id on shopkeepers
  for each row execute function identity_kinds_stay_separate();
