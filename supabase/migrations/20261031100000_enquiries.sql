-- Public enquiry surface: Contact requests, Newsletter subscriptions with a
-- suppression list, and SKU Waitlists. Written by the Shop server only
-- (service role); RLS stays on with no public policies.

-- Contact request: no Account, no Customer-visible status or confirmation.
create table contact_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  received_at timestamptz not null default now(),
  constraint contact_requests_name_present check (length(btrim(name)) between 1 and 120),
  constraint contact_requests_email_present check (length(btrim(email)) between 3 and 254),
  constraint contact_requests_phone_length check (phone is null or length(phone) <= 30),
  constraint contact_requests_subject_present check (length(btrim(subject)) between 1 and 150),
  constraint contact_requests_message_present check (length(btrim(message)) between 1 and 5000)
);

create index contact_requests_received_at_idx on contact_requests (received_at desc);

alter table contact_requests enable row level security;

-- Newsletter subscription: single opt-in with consent evidence.
-- Emails are stored lower-cased so one address has one subscription.
create table newsletter_subscriptions (
  email text primary key,
  consented_at timestamptz not null,
  policy_version text not null,
  unsubscribe_token uuid not null unique,
  constraint newsletter_subscriptions_email_lower check (email = lower(email)),
  constraint newsletter_subscriptions_policy_version_present check (length(policy_version) > 0)
);

alter table newsletter_subscriptions enable row level security;

-- An unsubscribed address is kept only here, never with its consent record.
create table newsletter_suppressions (
  email text primary key,
  suppressed_at timestamptz not null default now(),
  constraint newsletter_suppressions_email_lower check (email = lower(email))
);

alter table newsletter_suppressions enable row level security;

-- Waitlist: one entry per email and SKU; cleared after the restock email.
create table waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  sku_id uuid not null references skus (id) on delete cascade,
  email text not null,
  phone text,
  created_at timestamptz not null default now(),
  constraint waitlist_entries_email_lower check (email = lower(email)),
  constraint waitlist_entries_phone_length check (phone is null or length(phone) <= 30),
  constraint waitlist_entries_one_per_email_sku unique (sku_id, email)
);

alter table waitlist_entries enable row level security;
