-- Home slice: Whiskies + House pick. RLS on as a backstop; Next server uses service credentials.

create extension if not exists "pgcrypto";

create type origin as enum ('Irish', 'Scotch', 'Bourbon', 'Japanese');

create table whiskies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo_url text not null,
  origin origin not null,
  created_at timestamptz not null default now(),
  constraint whiskies_name_not_blank check (char_length(trim(name)) > 0),
  constraint whiskies_photo_url_not_blank check (char_length(trim(photo_url)) > 0)
);

create table house_picks (
  id uuid primary key default gen_random_uuid(),
  whisky_id uuid not null references whiskies (id) on delete cascade,
  story text not null,
  month_label text,
  created_at timestamptz not null default now(),
  constraint house_picks_story_not_blank check (char_length(trim(story)) > 0)
);

-- At most one current House pick
create unique index house_picks_one_row on house_picks ((true));

create index whiskies_origin_idx on whiskies (origin);

alter table whiskies enable row level security;
alter table house_picks enable row level security;

-- Seed for first-slice home (until Shopkeeper UI in #3)
insert into whiskies (id, name, photo_url, origin) values
  ('11111111-1111-1111-1111-111111111111', 'GlenAllachie 12', '/bottles/glenallachie-12.svg', 'Scotch'),
  ('22222222-2222-2222-2222-222222222222', 'Redbreast 12', '/bottles/redbreast-12.svg', 'Irish'),
  ('33333333-3333-3333-3333-333333333333', 'Buffalo Trace', '/bottles/buffalo-trace.svg', 'Bourbon'),
  ('44444444-4444-4444-4444-444444444444', 'Yamazaki Distiller''s Reserve', '/bottles/yamazaki-reserve.svg', 'Japanese'),
  ('55555555-5555-5555-5555-555555555555', 'Laphroaig 10', '/bottles/laphroaig-10.svg', 'Scotch');

insert into house_picks (whisky_id, story, month_label) values
  (
    '11111111-1111-1111-1111-111111111111',
    'Сърцето на възродената дестилерия от мастър-дистилър Били Уокър',
    'Март 2025'
  );
