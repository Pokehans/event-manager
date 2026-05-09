-- 1) Kategorien für Angebotspositionen
create table public.offer_categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.offer_categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Angebotspositionen / Preislisten-Items
create table public.offer_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.offer_categories(id) on delete restrict,

  name text not null,
  description text,

  unit text not null,
  price numeric(10,2) not null default 0,

  item_type text not null default 'item',
  tax_rate numeric(5,2) not null default 8.10,

  is_active boolean not null default true,
  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint offer_items_unit_check check (
    unit in ('person', 'piece', 'bottle', 'liter', 'day', 'half_day', 'flat', 'portion')
  ),

  constraint offer_items_item_type_check check (
    item_type in ('item', 'package')
  )
);

-- 3) Indizes
create index offer_categories_parent_id_idx
on public.offer_categories(parent_id);

create index offer_items_category_id_idx
on public.offer_items(category_id);

create index offer_items_is_active_idx
on public.offer_items(is_active);

-- Hauptkategorien
insert into public.offer_categories (name, slug, sort_order)
values
  ('Food', 'food', 10),
  ('Getränke', 'getraenke', 20),
  ('Seminare', 'seminare', 30),
  ('Räume', 'raeume', 40),
  ('Technik', 'technik', 50),
  ('Extras', 'extras', 60);

-- Food Unterkategorien
insert into public.offer_categories (parent_id, name, slug, sort_order)
select id, 'Vorspeisen', 'food-vorspeisen', 10 from public.offer_categories where slug = 'food';

insert into public.offer_categories (parent_id, name, slug, sort_order)
select id, 'Suppen', 'food-suppen', 20 from public.offer_categories where slug = 'food';

insert into public.offer_categories (parent_id, name, slug, sort_order)
select id, 'Hauptgänge', 'food-hauptgaenge', 30 from public.offer_categories where slug = 'food';

insert into public.offer_categories (parent_id, name, slug, sort_order)
select id, 'Beilagen', 'food-beilagen', 40 from public.offer_categories where slug = 'food';

insert into public.offer_categories (parent_id, name, slug, sort_order)
select id, 'Desserts', 'food-desserts', 50 from public.offer_categories where slug = 'food';

insert into public.offer_categories (parent_id, name, slug, sort_order)
select id, 'Extras', 'food-extras', 60 from public.offer_categories where slug = 'food';

-- Hauptgänge Unterkategorien
insert into public.offer_categories (parent_id, name, slug, sort_order)
select id, 'Schwein', 'food-hauptgaenge-schwein', 10 from public.offer_categories where slug = 'food-hauptgaenge';

insert into public.offer_categories (parent_id, name, slug, sort_order)
select id, 'Rind', 'food-hauptgaenge-rind', 20 from public.offer_categories where slug = 'food-hauptgaenge';

insert into public.offer_categories (parent_id, name, slug, sort_order)
select id, 'Kalb', 'food-hauptgaenge-kalb', 30 from public.offer_categories where slug = 'food-hauptgaenge';

insert into public.offer_categories (parent_id, name, slug, sort_order)
select id, 'Geflügel', 'food-hauptgaenge-gefluegel', 40 from public.offer_categories where slug = 'food-hauptgaenge';

insert into public.offer_categories (parent_id, name, slug, sort_order)
select id, 'Fisch', 'food-hauptgaenge-fisch', 50 from public.offer_categories where slug = 'food-hauptgaenge';

insert into public.offer_categories (parent_id, name, slug, sort_order)
select id, 'Vegetarisch', 'food-hauptgaenge-vegetarisch', 60 from public.offer_categories where slug = 'food-hauptgaenge';

-- Beilagen Unterkategorien
insert into public.offer_categories (parent_id, name, slug, sort_order)
select id, 'Stärkebeilagen', 'food-beilagen-staerke', 10 from public.offer_categories where slug = 'food-beilagen';

insert into public.offer_categories (parent_id, name, slug, sort_order)
select id, 'Gemüsebeilagen', 'food-beilagen-gemuese', 20 from public.offer_categories where slug = 'food-beilagen';

-- Seminare
insert into public.offer_categories (parent_id, name, slug, sort_order)
select id, 'Kaffeepausen', 'seminare-kaffeepausen', 10 from public.offer_categories where slug = 'seminare';

insert into public.offer_categories (parent_id, name, slug, sort_order)
select id, 'Seminarpauschalen', 'seminare-pauschalen', 20 from public.offer_categories where slug = 'seminare';

insert into public.offer_categories (parent_id, name, slug, sort_order)
select id, 'Seminar-Extras', 'seminare-extras', 30 from public.offer_categories where slug = 'seminare';

-- Getränke
insert into public.offer_categories (parent_id, name, slug, sort_order)
select id, 'Warme Getränke', 'getraenke-warm', 10 from public.offer_categories where slug = 'getraenke';

insert into public.offer_categories (parent_id, name, slug, sort_order)
select id, 'Kalte Getränke', 'getraenke-kalt', 20 from public.offer_categories where slug = 'getraenke';

insert into public.offer_categories (parent_id, name, slug, sort_order)
select id, 'Bier / Most', 'getraenke-bier-most', 30 from public.offer_categories where slug = 'getraenke';

insert into public.offer_categories (parent_id, name, slug, sort_order)
select id, 'Aperitif', 'getraenke-aperitif', 40 from public.offer_categories where slug = 'getraenke';

insert into public.offer_categories (parent_id, name, slug, sort_order)
select id, 'Spirituosen', 'getraenke-spirituosen', 50 from public.offer_categories where slug = 'getraenke';

insert into public.offer_categories (parent_id, name, slug, sort_order)
select id, 'Offenausschank', 'getraenke-offenausschank', 60 from public.offer_categories where slug = 'getraenke';

insert into public.offer_categories (parent_id, name, slug, sort_order)
select id, 'Flaschenweine', 'getraenke-flaschenweine', 70 from public.offer_categories where slug = 'getraenke';

insert into public.offer_items (category_id, name, unit, price)
select id, 'Knackiger Blattsalat mit Kräutercroutons', 'person', 8.00
from public.offer_categories where slug = 'food-vorspeisen';

insert into public.offer_items (category_id, name, unit, price)
select id, 'Gemischter Salat nach Saison', 'person', 9.00
from public.offer_categories where slug = 'food-vorspeisen';

insert into public.offer_items (category_id, name, unit, price)
select id, 'Nüsslisalat mit Speck, Ei und Croutons', 'person', 16.00
from public.offer_categories where slug = 'food-vorspeisen';

insert into public.offer_items (category_id, name, unit, price)
select id, 'Bouillon mit Einlage', 'person', 7.50
from public.offer_categories where slug = 'food-suppen';

insert into public.offer_items (category_id, name, unit, price)
select id, 'Pastinaken-Apfel-Suppe', 'person', 10.50
from public.offer_categories where slug = 'food-suppen';

insert into public.offer_items (category_id, name, unit, price)
select id, 'Tagessuppe', 'person', 7.50
from public.offer_categories where slug = 'food-suppen';

insert into public.offer_items (category_id, name, unit, price)
select id, 'Rahmschnitzel an Pilzsauce', 'person', 24.00
from public.offer_categories where slug = 'food-hauptgaenge-schwein';

insert into public.offer_items (category_id, name, unit, price)
select id, 'Paniertes Schnitzel', 'person', 26.00
from public.offer_categories where slug = 'food-hauptgaenge-schwein';

insert into public.offer_items (category_id, name, unit, price)
select id, 'Gespickter Schmorbraten', 'person', 32.00
from public.offer_categories where slug = 'food-hauptgaenge-rind';

insert into public.offer_items (category_id, name, unit, price)
select id, 'Roastbeef an Bernaisesauce', 'person', 39.00
from public.offer_categories where slug = 'food-hauptgaenge-rind';

insert into public.offer_items (category_id, name, unit, price)
select id, 'Zucchetti Piccata', 'person', 23.00
from public.offer_categories where slug = 'food-hauptgaenge-vegetarisch';

insert into public.offer_items (category_id, name, unit, price)
select id, 'Gemüsestrudel mit Sauerrahmdipp', 'person', 24.00
from public.offer_categories where slug = 'food-hauptgaenge-vegetarisch';

insert into public.offer_items (category_id, name, unit, price)
select id, 'Pommes Frites', 'portion', 0.00
from public.offer_categories where slug = 'food-beilagen-staerke';

insert into public.offer_items (category_id, name, unit, price)
select id, 'Ratatouille', 'portion', 0.00
from public.offer_categories where slug = 'food-beilagen-gemuese';

insert into public.offer_items (category_id, name, unit, price)
select id, 'Zusätzliche Beilage', 'person', 4.50
from public.offer_categories where slug = 'food-extras';

insert into public.offer_items (category_id, name, unit, price, item_type)
select id, 'Seminarpauschale Klein', 'person', 68.00, 'package'
from public.offer_categories where slug = 'seminare-pauschalen';

insert into public.offer_items (category_id, name, unit, price, item_type)
select id, 'Seminarpauschale Mittel', 'person', 75.00, 'package'
from public.offer_categories where slug = 'seminare-pauschalen';

insert into public.offer_items (category_id, name, unit, price, item_type)
select id, 'Seminarpauschale Gross', 'person', 85.00, 'package'
from public.offer_categories where slug = 'seminare-pauschalen';