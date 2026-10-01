-- Whisky detail page fields, SKU volume, and editorial tables.

alter table skus
  add column volume_ml integer not null default 700;

alter table skus
  add constraint skus_volume_ml_positive check (volume_ml > 0);

alter table whiskies
  add column photo_captions text[] not null default '{}',
  add column description text,
  add column natural_colour boolean,
  add column house_video_url text;

create table whisky_awards (
  id uuid primary key default gen_random_uuid(),
  whisky_id uuid not null references whiskies (id) on delete cascade,
  title text not null,
  organisation text not null,
  year integer not null,
  category text not null,
  sort_order integer not null default 0,
  constraint whisky_awards_title_not_blank check (char_length(trim(title)) > 0)
);

create index whisky_awards_whisky_id_idx on whisky_awards (whisky_id);

create table whisky_tastings (
  id uuid primary key default gen_random_uuid(),
  whisky_id uuid not null references whiskies (id) on delete cascade,
  author_first_name text not null,
  author_last_name text not null,
  body text not null,
  score numeric(3, 1),
  verified_purchase boolean not null default false,
  approved boolean not null default true,
  sort_order integer not null default 0,
  constraint whisky_tastings_score_range check (
    score is null or (score >= 1.0 and score <= 10.0)
  )
);

create index whisky_tastings_whisky_id_idx on whisky_tastings (whisky_id);

create table whisky_pairings (
  id uuid primary key default gen_random_uuid(),
  whisky_id uuid not null references whiskies (id) on delete cascade,
  eyebrow text not null,
  title text not null,
  body text not null,
  photo_url text not null,
  sort_order integer not null default 0
);

create index whisky_pairings_whisky_id_idx on whisky_pairings (whisky_id);

create table whisky_related_sets (
  whisky_id uuid primary key references whiskies (id) on delete cascade,
  title text not null,
  description text not null,
  price_eur numeric not null,
  photo_url text not null,
  constraint whisky_related_sets_price_positive check (price_eur > 0)
);

alter table whisky_awards enable row level security;
alter table whisky_tastings enable row level security;
alter table whisky_pairings enable row level security;
alter table whisky_related_sets enable row level security;

-- GlenAllachie House pick seed whisky: rich detail for the PDP reference.
update whiskies
set
  description = 'Специално матуриране в комбинация от Pedro Ximénez, Oloroso Sherry и Virgin Oak бъчви. Бутилирано с естествен цвят на богат полиран кехлибар, без студена филтрация, при 46% алкохолен градус.',
  natural_colour = true,
  house_video_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  photo_captions = array['Фронтален', 'Кутия (Gift)', 'Бъчви & Дъб', '50ml Семпъл']
where id = '11111111-1111-1111-1111-111111111111';

insert into whisky_awards (whisky_id, title, organisation, year, category, sort_order) values
  (
    '11111111-1111-1111-1111-111111111111',
    'Двоен златен медал',
    'San Francisco WSC',
    2023,
    'Single Malt Scotch 12 Y.O.',
    0
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Най-добър Speyside Single Malt',
    'World Whiskies Awards',
    2022,
    'Speyside 12 & Under',
    1
  );

insert into whisky_pairings (
  whisky_id, eyebrow, title, body, photo_url, sort_order
) values
  (
    '11111111-1111-1111-1111-111111111111',
    'Шоколадов баланс',
    'Крафт шоколад с морска сол',
    '70% еквадорско какао с фльор дьо сел балансира сладостта на стафидите и мока акцентите в небцето.',
    '/bottles/glenallachie-12.svg',
    0
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Отлежало сирене',
    'Отлежала Гауда (24+ месеца)',
    'Хрупкавите протеинови кристали и карамелената масленост на сиренето резонират великолепно с испанския дъб.',
    '/bottles/glenallachie-12.svg',
    1
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Пура формат',
    'Пура Robusto с Maduro обвивка',
    'Тъмният мадуро тютюнев лист допълва пикантния финал на Virgin Oak дъбовото влияние без да доминира малца.',
    '/bottles/glenallachie-12.svg',
    2
  );

insert into whisky_related_sets (whisky_id, title, description, price_eur, photo_url) values
  (
    '11111111-1111-1111-1111-111111111111',
    'Добави „Шери Трилогията“ 3 x 50ml Сет',
    'Сравнете GlenAllachie 12 с две други емблематични шери дестилерии в индивидуален дегустационен сет от по 50ml.',
    18.25,
    '/bottles/glenallachie-12.svg'
  );
