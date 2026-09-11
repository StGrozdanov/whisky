-- Catalogue of Whiskies: Whisky, House tasting, Flavour tags, SKU
-- RLS on as a backstop; Next server uses service credentials.

create extension if not exists "pgcrypto";

create type origin as enum ('Irish', 'Scotch', 'Bourbon', 'Japanese');

create type sweetness as enum ('сухо', 'балансирано', 'сладко');

create type smoke as enum ('без', 'лек', 'среден', 'силен');

create type flavour_tag as enum (
  'ванилия',
  'мед',
  'карамел',
  'шоколад',
  'сушени плодове',
  'цитрус',
  'ябълка',
  'круша',
  'тропически'
);

create table whiskies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo_url text not null,
  origin origin not null,
  created_at timestamptz not null default now(),
  constraint whiskies_name_not_blank check (char_length(trim(name)) > 0),
  constraint whiskies_photo_url_not_blank check (char_length(trim(photo_url)) > 0)
);

create table house_tastings (
  whisky_id uuid primary key references whiskies (id) on delete cascade,
  nose text not null,
  taste text not null,
  aftertaste text not null,
  sweetness sweetness not null,
  smoke smoke not null,
  constraint house_tastings_nose_not_blank check (char_length(trim(nose)) > 0),
  constraint house_tastings_taste_not_blank check (char_length(trim(taste)) > 0),
  constraint house_tastings_aftertaste_not_blank check (char_length(trim(aftertaste)) > 0)
);

create table house_tasting_flavour_tags (
  whisky_id uuid not null references house_tastings (whisky_id) on delete cascade,
  flavour_tag flavour_tag not null,
  primary key (whisky_id, flavour_tag)
);

create table skus (
  id uuid primary key default gen_random_uuid(),
  whisky_id uuid not null references whiskies (id) on delete cascade,
  size text not null,
  price_euro numeric(10, 2) not null,
  quantity integer not null default 0,
  created_at timestamptz not null default now(),
  constraint skus_size_not_blank check (char_length(trim(size)) > 0),
  constraint skus_price_positive check (price_euro > 0),
  constraint skus_quantity_non_negative check (quantity >= 0),
  constraint skus_one_size_per_whisky unique (whisky_id, size)
);

create index skus_whisky_id_idx on skus (whisky_id);
create index whiskies_origin_idx on whiskies (origin);

alter table whiskies enable row level security;
alter table house_tastings enable row level security;
alter table house_tasting_flavour_tags enable row level security;
alter table skus enable row level security;
