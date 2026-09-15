-- House pick spotlight fields: ABV / non-chill on Whisky; YouTube, note, display price on House pick.

alter table whiskies
  add column abv numeric,
  add column non_chill_filtered boolean;

alter table house_picks
  add column youtube_url text,
  add column note_author_name text,
  add column note_author_role text,
  add column note_score numeric,
  add column note_quote text,
  add column display_price_eur numeric;

update whiskies
set
  abv = 46.0,
  non_chill_filtered = true
where id = '11111111-1111-1111-1111-111111111111';

update house_picks
set
  note_author_name = 'Стоян Грозданов',
  note_author_role = 'Главен Дегустатор, whiskyfinder.bg',
  note_score = 9.3,
  note_quote = '„Монументален шери профил. Истинско тържество на Pedro Ximénez и Oloroso бъчвите без добавен карамел или студена филтрация. Вкусът отваря с мока, марокански стафиди и фин смолист дъб.“',
  display_price_eur = 55.20
where whisky_id = '11111111-1111-1111-1111-111111111111';
