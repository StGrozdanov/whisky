-- Guest discovery pages: Promotions per SKU with a Home selection, Pack quantity,
-- and Shopkeeper-selected Gifts. Seeded until Shopkeeper UI (#25).

-- A Promotion reduces one SKU. Home shows it only when the Shopkeeper selects it.
alter table home_promotions rename to promotions;
alter index home_promotions_pkey rename to promotions_pkey;
alter index home_promotions_sort_order_idx rename to promotions_sort_order_idx;
drop index home_promotions_whisky_id_uidx;

alter table promotions rename constraint home_promotions_discounted_positive to promotions_discounted_positive;
alter table promotions rename constraint home_promotions_prior_positive to promotions_prior_positive;
alter table promotions rename constraint home_promotions_discounted_lt_prior to promotions_discounted_lt_prior;
alter table promotions rename constraint home_promotions_window to promotions_window;
alter table promotions rename constraint home_promotions_whisky_id_fkey to promotions_whisky_id_fkey;

alter table skus
  add constraint skus_id_whisky_id_key unique (id, whisky_id);

alter table promotions
  add column sku_id uuid,
  add column featured_on_home boolean not null default false;

update promotions
set sku_id = skus.id, featured_on_home = true
from skus
where skus.whisky_id = promotions.whisky_id and skus.is_primary;

delete from promotions where sku_id is null;

alter table promotions
  alter column sku_id set not null,
  add constraint promotions_sku_fkey
    foreign key (sku_id, whisky_id) references skus (id, whisky_id) on delete cascade;

-- A SKU keeps its past and scheduled Promotions, but their periods never overlap.
create extension if not exists btree_gist;

alter table promotions
  add constraint promotions_sku_period_excl
    exclude using gist (sku_id with =, tstzrange(starts_at, ends_at) with &&);

-- A Pack is sold by its own quantity, independent of its lineup.
alter table discovery_packs
  add column quantity integer not null default 0,
  add constraint discovery_packs_quantity_non_negative check (quantity >= 0);

update discovery_packs set quantity = 6
where id in (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);

-- Gift page: one row per selected Whisky or Pack.
create table gift_selections (
  id uuid primary key default gen_random_uuid(),
  whisky_id uuid references whiskies (id) on delete cascade,
  pack_id uuid references discovery_packs (id) on delete cascade,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  constraint gift_selections_one_target check (num_nonnulls(whisky_id, pack_id) = 1)
);

create unique index gift_selections_whisky_id_uidx on gift_selections (whisky_id)
  where whisky_id is not null;
create unique index gift_selections_pack_id_uidx on gift_selections (pack_id)
  where pack_id is not null;
create index gift_selections_sort_order_idx on gift_selections (sort_order);

alter table gift_selections enable row level security;

insert into gift_selections (whisky_id, pack_id, sort_order)
select seed.whisky_id, seed.pack_id, seed.sort_order
from (values
  ('11111111-1111-1111-1111-111111111111'::uuid, null::uuid, 1),
  (null, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2),
  ('22222222-2222-2222-2222-222222222222', null, 3),
  ('99999999-9999-9999-9999-999999999999', null, 4),
  (null, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 5)
) as seed (whisky_id, pack_id, sort_order)
where exists (select 1 from whiskies where whiskies.id = seed.whisky_id)
   or exists (select 1 from discovery_packs where discovery_packs.id = seed.pack_id);

-- An Award is identified by what it is, so the Award page can key on it.
-- Keep the first of any duplicates entered before this rule existed.
delete from whisky_awards duplicate
using whisky_awards kept
where duplicate.whisky_id = kept.whisky_id
  and duplicate.organisation = kept.organisation
  and duplicate.year = kept.year
  and duplicate.category = kept.category
  and duplicate.title = kept.title
  and (duplicate.sort_order, duplicate.id) > (kept.sort_order, kept.id);

create unique index whisky_awards_identity_uidx
  on whisky_awards (whisky_id, organisation, year, category, title);

-- More awarded Whiskies so the Award page has more than one entry.
insert into whisky_awards (whisky_id, title, organisation, year, category, sort_order)
select seed.whisky_id, seed.title, seed.organisation, seed.year, seed.category, 0
from (values
  (
    '22222222-2222-2222-2222-222222222222'::uuid,
    'Златен медал',
    'International Spirits Challenge',
    2024,
    'Irish Single Pot Still'
  ),
  (
    '99999999-9999-9999-9999-999999999999',
    'Сребърен медал',
    'IWSC',
    2023,
    'Scotch Single Malt 15 Y.O.'
  )
) as seed (whisky_id, title, organisation, year, category)
where exists (select 1 from whiskies where whiskies.id = seed.whisky_id)
on conflict (whisky_id, organisation, year, category, title) do nothing;
