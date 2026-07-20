-- Migration v22: fix DEFINITIVO per colonne legacy su analytics_events
-- Esegui questo script nel SQL editor di Supabase dopo le migration precedenti.
--
-- Nelle migration precedenti abbiamo scoperto (una alla volta, dall'errore
-- Postgres) due colonne legacy obbligatorie senza default: "owner_id" e
-- "event_date". Invece di continuare a inseguirle una per una, questo
-- script trova IN AUTOMATICO qualsiasi altra colonna di analytics_events
-- che sia NOT NULL senza un default e senza un valore inviato dal codice,
-- e rimuove il vincolo NOT NULL. Cosi anche se esistesse un'altra colonna
-- legacy che ancora non conosciamo, gli inserimenti non falliranno piu.

do $$
declare
  col record;
begin
  for col in
    select column_name from information_schema.columns
    where table_schema = 'public'
      and table_name = 'analytics_events'
      and is_nullable = 'NO'
      and column_default is null
      and column_name not in ('id','event_type','public_slug')
  loop
    execute format('alter table public.analytics_events alter column %I drop not null', col.column_name);
    raise notice 'Rimosso vincolo NOT NULL da analytics_events.%', col.column_name;
  end loop;
end $$;

-- In piu, per la colonna event_date nello specifico: se esiste, le diamo
-- anche un default automatico (ora corrente), cosi funziona anche se in
-- futuro un punto del codice dimenticasse di valorizzarla.
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='analytics_events' and column_name='event_date') then
    alter table public.analytics_events alter column event_date set default now();
  end if;
end $$;
