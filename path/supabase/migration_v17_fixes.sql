-- Migration v17: controllo utente su email/contatto pubblici + fix analytics
-- Esegui questo script nel SQL editor di Supabase dopo le migration precedenti.

-- 1) L'utente può scegliere se rendere pubblici email e pulsante "contattami"
alter table public.personal_info add column if not exists show_contact_public boolean not null default true;

-- 2) Fix difensivo per gli analytics: ricrea vincoli e policy nel caso in cui
--    la tabella analytics_events sia stata creata in precedenza con valori
--    diversi da quelli usati dall'applicazione (profile_view / qr_scan).
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='analytics_events') then
    alter table public.analytics_events drop constraint if exists analytics_events_event_type_check;
    alter table public.analytics_events add constraint analytics_events_event_type_check check (event_type in ('profile_view','qr_scan'));
  end if;
end $$;

alter table public.analytics_events enable row level security;
drop policy if exists "analytics insert public" on public.analytics_events;
create policy "analytics insert public" on public.analytics_events for insert with check (true);
drop policy if exists "analytics owner select" on public.analytics_events;
create policy "analytics owner select" on public.analytics_events for select using (auth.uid() = profile_user_id or public.is_app_admin());
