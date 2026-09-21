-- Catalogue: publication, Whisky detail fields, Primary SKUs, seed ≥25 published + draft + Ask-us.

create type experience_level as enum ('beginner', 'advanced');

alter table whiskies
  add column distillery text,
  add column country text,
  add column region text,
  add column published boolean not null default true,
  add column age_years integer,
  add column experience_level experience_level,
  add column house_score numeric(3, 1),
  add column tagline text;

-- Backfill existing Home Whiskies before NOT NULL constraints.
update whiskies set
  distillery = case id
    when '11111111-1111-1111-1111-111111111111' then 'GlenAllachie'
    when '22222222-2222-2222-2222-222222222222' then 'Redbreast'
    when '33333333-3333-3333-3333-333333333333' then 'Buffalo Trace'
    when '44444444-4444-4444-4444-444444444444' then 'Yamazaki'
    when '55555555-5555-5555-5555-555555555555' then 'Laphroaig'
    when '66666666-6666-6666-6666-666666666666' then 'Arran'
    when '77777777-7777-7777-7777-777777777777' then 'Kilkerran'
    when '88888888-8888-8888-8888-888888888888' then 'Bunnahabhain'
    when '99999999-9999-9999-9999-999999999999' then 'Glendronach'
    when 'a1111111-1111-1111-1111-111111111111' then 'Springbank'
    when 'b2222222-2222-2222-2222-222222222222' then 'Loch Lomond'
    when 'c3333333-3333-3333-3333-333333333333' then 'Benromach'
    when 'd4444444-4444-4444-4444-444444444444' then 'Port Charlotte'
    when 'e5555555-5555-5555-5555-555555555555' then 'Mars Shinshu'
    when 'f6666666-6666-6666-6666-666666666666' then 'Nikka'
    else 'Unknown'
  end,
  country = case origin
    when 'Scotch' then 'Шотландия'
    when 'Irish' then 'Ирландия'
    when 'Bourbon' then 'САЩ'
    when 'Japanese' then 'Япония'
  end,
  region = case id
    when '11111111-1111-1111-1111-111111111111' then 'Speyside'
    when '22222222-2222-2222-2222-222222222222' then null
    when '33333333-3333-3333-3333-333333333333' then 'Kentucky'
    when '44444444-4444-4444-4444-444444444444' then null
    when '55555555-5555-5555-5555-555555555555' then 'Islay'
    when '66666666-6666-6666-6666-666666666666' then 'Isle of Arran'
    when '77777777-7777-7777-7777-777777777777' then 'Campbeltown'
    when '88888888-8888-8888-8888-888888888888' then 'Islay'
    when '99999999-9999-9999-9999-999999999999' then 'Highland'
    when 'a1111111-1111-1111-1111-111111111111' then 'Campbeltown'
    when 'b2222222-2222-2222-2222-222222222222' then 'Highland'
    when 'c3333333-3333-3333-3333-333333333333' then 'Speyside'
    when 'd4444444-4444-4444-4444-444444444444' then 'Islay'
    when 'e5555555-5555-5555-5555-555555555555' then 'Shinshu'
    when 'f6666666-6666-6666-6666-666666666666' then 'Hokkaido'
    else null
  end,
  age_years = case id
    when '11111111-1111-1111-1111-111111111111' then 12
    when '22222222-2222-2222-2222-222222222222' then 12
    when '33333333-3333-3333-3333-333333333333' then null
    when '44444444-4444-4444-4444-444444444444' then null
    when '55555555-5555-5555-5555-555555555555' then 10
    when '66666666-6666-6666-6666-666666666666' then 10
    when '77777777-7777-7777-7777-777777777777' then 12
    when '88888888-8888-8888-8888-888888888888' then 12
    when '99999999-9999-9999-9999-999999999999' then 15
    when 'a1111111-1111-1111-1111-111111111111' then 10
    when 'b2222222-2222-2222-2222-222222222222' then 14
    when 'c3333333-3333-3333-3333-333333333333' then null
    when 'd4444444-4444-4444-4444-444444444444' then 10
    when 'e5555555-5555-5555-5555-555555555555' then null
    when 'f6666666-6666-6666-6666-666666666666' then null
    else null
  end,
  experience_level = case id
    when '11111111-1111-1111-1111-111111111111' then 'advanced'::experience_level
    when '22222222-2222-2222-2222-222222222222' then 'advanced'::experience_level
    when '33333333-3333-3333-3333-333333333333' then 'beginner'::experience_level
    when '44444444-4444-4444-4444-444444444444' then 'advanced'::experience_level
    when '55555555-5555-5555-5555-555555555555' then 'advanced'::experience_level
    when '66666666-6666-6666-6666-666666666666' then 'beginner'::experience_level
    when '77777777-7777-7777-7777-777777777777' then 'advanced'::experience_level
    when '88888888-8888-8888-8888-888888888888' then 'advanced'::experience_level
    when '99999999-9999-9999-9999-999999999999' then 'advanced'::experience_level
    when 'a1111111-1111-1111-1111-111111111111' then 'advanced'::experience_level
    when 'b2222222-2222-2222-2222-222222222222' then 'beginner'::experience_level
    when 'c3333333-3333-3333-3333-333333333333' then 'advanced'::experience_level
    when 'd4444444-4444-4444-4444-444444444444' then 'advanced'::experience_level
    when 'e5555555-5555-5555-5555-555555555555' then 'beginner'::experience_level
    when 'f6666666-6666-6666-6666-666666666666' then 'advanced'::experience_level
    else null
  end,
  house_score = case id
    when '11111111-1111-1111-1111-111111111111' then 9.3
    when '22222222-2222-2222-2222-222222222222' then 9.4
    when '33333333-3333-3333-3333-333333333333' then 8.8
    when '44444444-4444-4444-4444-444444444444' then 9.2
    when '55555555-5555-5555-5555-555555555555' then 9.1
    when '66666666-6666-6666-6666-666666666666' then 9.0
    when '77777777-7777-7777-7777-777777777777' then 9.2
    when '88888888-8888-8888-8888-888888888888' then 9.1
    when '99999999-9999-9999-9999-999999999999' then 9.3
    when 'a1111111-1111-1111-1111-111111111111' then 9.3
    when 'b2222222-2222-2222-2222-222222222222' then 8.9
    when 'c3333333-3333-3333-3333-333333333333' then 9.0
    when 'd4444444-4444-4444-4444-444444444444' then 9.2
    when 'e5555555-5555-5555-5555-555555555555' then 8.7
    when 'f6666666-6666-6666-6666-666666666666' then 9.1
    else null
  end,
  tagline = case id
    when '11111111-1111-1111-1111-111111111111' then 'Pedro Ximénez & Oloroso Wood Finish'
    when '22222222-2222-2222-2222-222222222222' then 'Single Pot Still • Oloroso Sherry Casks'
    when '33333333-3333-3333-3333-333333333333' then 'Kentucky Straight Bourbon Whiskey'
    when '44444444-4444-4444-4444-444444444444' then 'Japanese Single Malt • Suntory'
    when '55555555-5555-5555-5555-555555555555' then 'Islay Single Malt • Medicinal Peat Smoke'
    when '66666666-6666-6666-6666-666666666666' then 'Island Single Malt • Non-chill Filtered'
    when '77777777-7777-7777-7777-777777777777' then 'Campbeltown Single Malt'
    when '88888888-8888-8888-8888-888888888888' then 'Islay Cask Strength'
    when '99999999-9999-9999-9999-999999999999' then 'Highland Single Malt • Sherry Cask'
    when 'a1111111-1111-1111-1111-111111111111' then 'Campbeltown Single Malt • 2.5 times Distilled'
    when 'b2222222-2222-2222-2222-222222222222' then 'Highland Single Malt • Organic'
    when 'c3333333-3333-3333-3333-333333333333' then 'Speyside • Peat Smoke'
    when 'd4444444-4444-4444-4444-444444444444' then 'Islay Single Malt • Heavily Peated 40 PPM'
    when 'e5555555-5555-5555-5555-555555555555' then 'Japanese Blended • Shinshu'
    when 'f6666666-6666-6666-6666-666666666666' then 'Hokkaido Single Malt'
    else null
  end;

alter table whiskies
  alter column distillery set not null,
  alter column country set not null;

alter table whiskies
  add constraint whiskies_distillery_not_blank check (char_length(trim(distillery)) > 0),
  add constraint whiskies_country_not_blank check (char_length(trim(country)) > 0),
  add constraint whiskies_age_years_positive check (age_years is null or age_years > 0),
  add constraint whiskies_house_score_range check (
    house_score is null or (house_score >= 1.0 and house_score <= 10.0)
  );

create table skus (
  id uuid primary key default gen_random_uuid(),
  whisky_id uuid not null references whiskies (id) on delete cascade,
  price_eur numeric not null,
  quantity integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  constraint skus_price_positive check (price_eur > 0),
  constraint skus_quantity_non_negative check (quantity >= 0)
);

create unique index skus_one_primary_per_whisky
  on skus (whisky_id)
  where is_primary;

create index skus_whisky_id_idx on skus (whisky_id);

alter table skus enable row level security;

-- Additional published Catalogue Whiskies (15 existing + 11 new = 26 published) + 1 draft.
insert into whiskies (
  id, name, photo_url, origin, abv, non_chill_filtered,
  distillery, country, region, published, age_years, experience_level, house_score, tagline
) values
  (
    '10101010-1010-1010-1010-101010101010',
    'Aberlour 12 Y.O.',
    '/bottles/glenallachie-12.svg',
    'Scotch',
    40.0,
    false,
    'Aberlour',
    'Шотландия',
    'Speyside',
    true,
    12,
    'beginner',
    9.1,
    'Double Cask Matured Speyside Single Malt'
  ),
  (
    '12121212-1212-1212-1212-121212121212',
    'Ardbeg An Oa',
    '/bottles/laphroaig-10.svg',
    'Scotch',
    46.6,
    true,
    'Ardbeg',
    'Шотландия',
    'Islay',
    true,
    null,
    'advanced',
    9.2,
    'Islay Single Malt • Peated & Sweet PX'
  ),
  (
    '13131313-1313-1313-1313-131313131313',
    'Balvenie 12 DoubleWood',
    '/bottles/glenallachie-12.svg',
    'Scotch',
    40.0,
    false,
    'Balvenie',
    'Шотландия',
    'Speyside',
    true,
    12,
    'beginner',
    9.3,
    'Speyside Single Malt • Bourbon & Sherry'
  ),
  (
    '14141414-1414-1414-1414-141414141414',
    'Bowmore 15 Y.O.',
    '/bottles/buffalo-trace.svg',
    'Scotch',
    43.0,
    false,
    'Bowmore',
    'Шотландия',
    'Islay',
    true,
    15,
    'advanced',
    9.1,
    'Islay Single Malt • Sherry Cask Finish'
  ),
  (
    '15151515-1515-1515-1515-151515151515',
    'Bushmills 10 Y.O.',
    '/bottles/redbreast-12.svg',
    'Irish',
    40.0,
    false,
    'Bushmills',
    'Ирландия',
    null,
    true,
    10,
    'beginner',
    8.8,
    'Irish Single Malt • Bourbon Cask'
  ),
  (
    '16161616-1616-1616-1616-161616161616',
    'Clynelish 14 Y.O.',
    '/bottles/glenallachie-12.svg',
    'Scotch',
    46.0,
    true,
    'Clynelish',
    'Шотландия',
    'Highland',
    true,
    14,
    'advanced',
    9.2,
    'Coastal Highland Single Malt • Waxy Profile'
  ),
  (
    '17171717-1717-1717-1717-171717171717',
    'Eagle Rare 10',
    '/bottles/buffalo-trace.svg',
    'Bourbon',
    45.0,
    false,
    'Eagle Rare',
    'САЩ',
    'Kentucky',
    true,
    10,
    'beginner',
    9.1,
    'Kentucky Straight Bourbon • Buffalo Trace'
  ),
  (
    '18181818-1818-1818-1818-181818181818',
    'Green Spot',
    '/bottles/redbreast-12.svg',
    'Irish',
    40.0,
    false,
    'Green Spot',
    'Ирландия',
    null,
    true,
    null,
    'advanced',
    9.1,
    'Single Pot Still Irish Whiskey'
  ),
  (
    '19191919-1919-1919-1919-191919191919',
    'Hibiki Harmony',
    '/bottles/yamazaki-reserve.svg',
    'Japanese',
    43.0,
    false,
    'Hibiki',
    'Япония',
    null,
    true,
    null,
    'advanced',
    9.4,
    'Suntory Japanese Blended Whisky'
  ),
  (
    '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a',
    'Highland Park 12 Y.O.',
    '/bottles/glenallachie-12.svg',
    'Scotch',
    40.0,
    false,
    'Highland Park',
    'Шотландия',
    'Orkney',
    true,
    12,
    'beginner',
    8.9,
    'Viking Honour Orkney Single Malt'
  ),
  (
    '1b1b1b1b-1b1b-1b1b-1b1b-1b1b1b1b1b1b',
    'Lagavulin 16 Y.O.',
    '/bottles/laphroaig-10.svg',
    'Scotch',
    43.0,
    false,
    'Lagavulin',
    'Шотландия',
    'Islay',
    true,
    16,
    'advanced',
    9.5,
    'The King of Islay • Deep Peat & Rich Smoke'
  ),
  (
    '1c1c1c1c-1c1c-1c1c-1c1c-1c1c1c1c1c1c',
    'Draft Speyside Reserve',
    '/bottles/glenallachie-12.svg',
    'Scotch',
    46.0,
    true,
    'Draft Distillery',
    'Шотландия',
    'Speyside',
    false,
    12,
    'advanced',
    9.0,
    'Unpublished draft — must not appear'
  );

-- Primary SKUs for every published Whisky. Eagle Rare is Ask-us (quantity 0).
insert into skus (whisky_id, price_eur, quantity, is_primary) values
  ('11111111-1111-1111-1111-111111111111', 55.20, 8, true),
  ('22222222-2222-2222-2222-222222222222', 50.00, 6, true),
  ('33333333-3333-3333-3333-333333333333', 35.00, 12, true),
  ('44444444-4444-4444-4444-444444444444', 72.00, 4, true),
  ('55555555-5555-5555-5555-555555555555', 51.00, 7, true),
  ('66666666-6666-6666-6666-666666666666', 52.00, 5, true),
  ('77777777-7777-7777-7777-777777777777', 74.00, 3, true),
  ('88888888-8888-8888-8888-888888888888', 89.00, 2, true),
  ('99999999-9999-9999-9999-999999999999', 115.00, 3, true),
  ('a1111111-1111-1111-1111-111111111111', 92.00, 0, true),
  ('b2222222-2222-2222-2222-222222222222', 54.50, 5, true),
  ('c3333333-3333-3333-3333-333333333333', 62.00, 4, true),
  ('d4444444-4444-4444-4444-444444444444', 64.40, 6, true),
  ('e5555555-5555-5555-5555-555555555555', 48.00, 8, true),
  ('f6666666-6666-6666-6666-666666666666', 69.00, 5, true),
  ('10101010-1010-1010-1010-101010101010', 52.00, 9, true),
  ('12121212-1212-1212-1212-121212121212', 59.00, 4, true),
  ('13131313-1313-1313-1313-131313131313', 63.00, 5, true),
  ('14141414-1414-1414-1414-141414141414', 78.00, 3, true),
  ('15151515-1515-1515-1515-151515151515', 36.00, 10, true),
  ('16161616-1616-1616-1616-161616161616', 68.00, 4, true),
  ('17171717-1717-1717-1717-171717171717', 55.00, 0, true),
  ('18181818-1818-1818-1818-181818181818', 58.00, 6, true),
  ('19191919-1919-1919-1919-191919191919', 135.00, 2, true),
  ('1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a', 46.00, 7, true),
  ('1b1b1b1b-1b1b-1b1b-1b1b-1b1b1b1b1b1b', 98.00, 3, true);
-- Draft Speyside Reserve has no SKU / is unpublished.
