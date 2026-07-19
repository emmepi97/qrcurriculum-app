-- Migration v21: slot sponsorizzati "Aree da migliorare" nel Job Match
-- Esegui questo script nel SQL editor di Supabase dopo le migration precedenti.
--
-- Come funziona: sotto ogni analisi Job Match, per ogni area di competenza
-- mancante nell'annuncio l'app mostra un corso consigliato. Se in questa
-- tabella esiste una riga ATTIVA per quella categoria, viene mostrata quella
-- (etichettata "Sponsorizzato", con link verso il fornitore reale) al posto
-- del suggerimento generico. Nessuna modifica di codice necessaria per
-- aggiungere/rimuovere sponsor: si gestisce tutto da Admin.

create table if not exists public.course_sponsors (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  provider_name text default '',
  url text not null,
  logo_url text default '',
  is_active boolean not null default true,
  priority int not null default 0,
  impressions int not null default 0,
  clicks int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.course_sponsors enable row level security;

-- Lettura pubblica (deve poter essere mostrato nel Job Match a chiunque),
-- ma solo delle righe attive.
drop policy if exists "course_sponsors public read active" on public.course_sponsors;
create policy "course_sponsors public read active" on public.course_sponsors
  for select using (is_active = true or public.is_app_admin());

-- Scrittura riservata all'admin (creazione/modifica sponsor, prezzi, link).
drop policy if exists "course_sponsors admin write" on public.course_sponsors;
create policy "course_sponsors admin write" on public.course_sponsors
  for insert with check (public.is_app_admin());
drop policy if exists "course_sponsors admin update" on public.course_sponsors;
create policy "course_sponsors admin update" on public.course_sponsors
  for update using (public.is_app_admin());
drop policy if exists "course_sponsors admin delete" on public.course_sponsors;
create policy "course_sponsors admin delete" on public.course_sponsors
  for delete using (public.is_app_admin());
