-- Migration v18: fix reale del bug analytics
-- Il tuo database ha (o aveva) una colonna "owner_id" su analytics_events,
-- obbligatoria (NOT NULL) ma senza default, residuo di una versione
-- precedente dello schema. Il codice non la valorizzava mai -> ogni
-- inserimento falliva con errore 400 "null value in column owner_id".
-- Ora il codice imposta sia profile_user_id che owner_id; qui sistemiamo
-- il database in modo che vada bene in ogni caso.

-- 1) Se la colonna non esiste (installazioni nuove), la creiamo.
alter table public.analytics_events add column if not exists owner_id uuid references auth.users(id) on delete cascade;

-- 2) In ogni caso, rendiamola opzionale: il codice la valorizza sempre,
--    ma così eventuali inserimenti futuri non falliscono più per questo.
alter table public.analytics_events alter column owner_id drop not null;

-- 3) Le policy restano valide su profile_user_id (colonna sempre valorizzata).
alter table public.analytics_events enable row level security;
drop policy if exists "analytics insert public" on public.analytics_events;
create policy "analytics insert public" on public.analytics_events for insert with check (true);
drop policy if exists "analytics owner select" on public.analytics_events;
create policy "analytics owner select" on public.analytics_events for select using (auth.uid() = profile_user_id or auth.uid() = owner_id or public.is_app_admin());
