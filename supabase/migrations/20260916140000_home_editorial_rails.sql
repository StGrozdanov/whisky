-- Home editorial rails: Shopkeeper-selected promotions, New Whiskies, and Discovery Packs.
-- Seeded until Shopkeeper UI (#25). No SKUs / publication in this slice.

create table home_promotions (
  id uuid primary key default gen_random_uuid(),
  whisky_id uuid not null references whiskies (id) on delete cascade,
  discounted_price_eur numeric not null,
  prior_price_eur numeric not null,
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  constraint home_promotions_discounted_positive check (discounted_price_eur > 0),
  constraint home_promotions_prior_positive check (prior_price_eur > 0),
  constraint home_promotions_discounted_lt_prior check (discounted_price_eur < prior_price_eur),
  constraint home_promotions_window check (
    starts_at is null or ends_at is null or starts_at < ends_at
  )
);

create unique index home_promotions_whisky_id_uidx on home_promotions (whisky_id);
create index home_promotions_sort_order_idx on home_promotions (sort_order);

create table home_new_whiskies (
  id uuid primary key default gen_random_uuid(),
  whisky_id uuid not null references whiskies (id) on delete cascade,
  display_price_eur numeric not null,
  badge text not null,
  note text not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  constraint home_new_whiskies_price_positive check (display_price_eur > 0),
  constraint home_new_whiskies_badge_not_blank check (char_length(trim(badge)) > 0),
  constraint home_new_whiskies_note_not_blank check (char_length(trim(note)) > 0)
);

create unique index home_new_whiskies_whisky_id_uidx on home_new_whiskies (whisky_id);
create index home_new_whiskies_sort_order_idx on home_new_whiskies (sort_order);

create table discovery_packs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  photo_url text not null,
  price_eur numeric not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  constraint discovery_packs_title_not_blank check (char_length(trim(title)) > 0),
  constraint discovery_packs_photo_url_not_blank check (char_length(trim(photo_url)) > 0),
  constraint discovery_packs_price_positive check (price_eur > 0)
);

create index discovery_packs_sort_order_idx on discovery_packs (sort_order);

create table discovery_pack_items (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references discovery_packs (id) on delete cascade,
  name text not null,
  detail text not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  constraint discovery_pack_items_name_not_blank check (char_length(trim(name)) > 0),
  constraint discovery_pack_items_detail_not_blank check (char_length(trim(detail)) > 0)
);

create index discovery_pack_items_pack_sort_idx on discovery_pack_items (pack_id, sort_order);

alter table home_promotions enable row level security;
alter table home_new_whiskies enable row level security;
alter table discovery_packs enable row level security;
alter table discovery_pack_items enable row level security;

-- Promotions: Redbreast 12 (15% off), Buffalo Trace (20% off). Open-ended active windows.
insert into home_promotions (whisky_id, discounted_price_eur, prior_price_eur, starts_at, ends_at, sort_order) values
  (
    '22222222-2222-2222-2222-222222222222',
    42.50,
    50.00,
    '2026-01-01T00:00:00Z',
    null,
    1
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    28.00,
    35.00,
    null,
    null,
    2
  );

-- New Whiskies: Yamazaki Distiller's Reserve, Laphroaig 10
insert into home_new_whiskies (whisky_id, display_price_eur, badge, note, sort_order) values
  (
    '44444444-4444-4444-4444-444444444444',
    72.00,
    'Ново',
    'Първо зареждане',
    1
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    49.50,
    'Ексклузивно',
    'Islay класика',
    2
  );

-- One Discovery Pack whose lineup uses seeded Whisky names
insert into discovery_packs (id, title, photo_url, price_eur, sort_order) values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Шери срещу Торф (3 x 50ml)',
    '/bottles/glenallachie-12.svg',
    21.50,
    1
  );

insert into discovery_pack_items (pack_id, name, detail, sort_order) values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '1. GlenAllachie 12',
    'Шери Pedro Ximénez • Speyside',
    1
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '2. Laphroaig 10',
    'Торф от остров Islay',
    2
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '3. Redbreast 12',
    'Ирландски пот стил',
    3
  );
