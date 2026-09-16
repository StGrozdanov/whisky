-- Expand Home editorial seed: ≥5 promotions, ≥5 New Whiskies, ≥3 Discovery Packs.

insert into whiskies (id, name, photo_url, origin, abv, non_chill_filtered) values
  ('66666666-6666-6666-6666-666666666666', 'Arran 10 Year Old', '/bottles/glenallachie-12.svg', 'Scotch', 46.0, true),
  ('77777777-7777-7777-7777-777777777777', 'Kilkerran 12 Campbeltown', '/bottles/redbreast-12.svg', 'Scotch', 46.0, true),
  ('88888888-8888-8888-8888-888888888888', 'Bunnahabhain 12 C.S.', '/bottles/buffalo-trace.svg', 'Scotch', 55.1, true),
  ('99999999-9999-9999-9999-999999999999', 'Glendronach 15 Revival', '/bottles/yamazaki-reserve.svg', 'Scotch', 46.0, false),
  ('a1111111-1111-1111-1111-111111111111', 'Springbank 10 Y.O. (2025)', '/bottles/laphroaig-10.svg', 'Scotch', 46.0, true),
  ('b2222222-2222-2222-2222-222222222222', 'Loch Lomond 14 Organic', '/bottles/glenallachie-12.svg', 'Scotch', 46.0, false),
  ('c3333333-3333-3333-3333-333333333333', 'Benromach Peat Smoke', '/bottles/redbreast-12.svg', 'Scotch', 46.0, true),
  ('d4444444-4444-4444-4444-444444444444', 'Port Charlotte 10 Peated', '/bottles/buffalo-trace.svg', 'Scotch', 50.0, true),
  ('e5555555-5555-5555-5555-555555555555', 'Mars Shinshu Iwai Tradition', '/bottles/yamazaki-reserve.svg', 'Japanese', 40.0, false),
  ('f6666666-6666-6666-6666-666666666666', 'Nikka Yoichi Single Malt', '/bottles/laphroaig-10.svg', 'Japanese', 45.0, false);

-- Clear thin first seed so rails rebuild to the agreed counts.
delete from discovery_pack_items;
delete from discovery_packs;
delete from home_promotions;
delete from home_new_whiskies;

insert into home_promotions (whisky_id, discounted_price_eur, prior_price_eur, starts_at, ends_at, sort_order) values
  ('22222222-2222-2222-2222-222222222222', 42.50, 50.00, '2026-01-01T00:00:00Z', null, 1),
  ('33333333-3333-3333-3333-333333333333', 28.00, 35.00, null, null, 2),
  ('66666666-6666-6666-6666-666666666666', 44.00, 52.00, null, null, 3),
  ('77777777-7777-7777-7777-777777777777', 59.00, 74.00, null, null, 4),
  ('88888888-8888-8888-8888-888888888888', 78.00, 89.00, null, null, 5);

insert into home_new_whiskies (whisky_id, display_price_eur, badge, note, sort_order) values
  ('44444444-4444-4444-4444-444444444444', 72.00, 'Ново', 'Първо зареждане', 1),
  ('55555555-5555-5555-5555-555555555555', 49.50, 'Ексклузивно', 'Islay класика', 2),
  ('a1111111-1111-1111-1111-111111111111', 68.00, 'Ново', 'Лимитиран тираж', 3),
  ('b2222222-2222-2222-2222-222222222222', 54.50, 'Ново', 'Био сертифициран', 4),
  ('c3333333-3333-3333-3333-333333333333', 62.00, 'Ексклузивно', 'Първо зареждане', 5);

insert into discovery_packs (id, title, photo_url, price_eur, sort_order) values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Шери срещу Торф (3 x 50ml)',
    '/bottles/glenallachie-12.svg',
    21.50,
    1
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'The Japanese Craft Trio (3 x 50ml)',
    '/bottles/yamazaki-reserve.svg',
    29.60,
    2
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Campbeltown & Islay (3 x 50ml)',
    '/bottles/laphroaig-10.svg',
    24.90,
    3
  );

insert into discovery_pack_items (pack_id, name, detail, sort_order) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '1. GlenAllachie 12', 'Шери Pedro Ximénez • Speyside', 1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2. Laphroaig 10', 'Торф от остров Islay', 2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '3. Redbreast 12', 'Ирландски пот стил', 3),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '1. Yamazaki Distiller''s Reserve', 'Японски алпийски малц', 1),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2. Mars Shinshu Iwai Tradition', 'Японски кедър • Shinshu', 2),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '3. Nikka Yoichi Single Malt', 'Хокайдо • въглищен дестилат', 3),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '1. Springbank 10 Y.O. (2025)', 'Campbeltown • лимитиран', 1),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '2. Kilkerran 12 Campbeltown', 'Campbeltown Single Malt', 2),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '3. Port Charlotte 10 Peated', 'Islay • 40 ppm', 3);
