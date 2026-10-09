-- Migration v19: Job Match con AI opzionale, attivabile dall'admin
-- Esegui questo script nel SQL editor di Supabase dopo le migration precedenti.

create table if not exists public.ai_settings (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'anthropic',
  api_key text,
  model text not null default 'claude-haiku-4-5',
  is_active boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.ai_settings enable row level security;

-- Solo l'admin può leggere/scrivere questa tabella dal frontend (contiene
-- la chiave API). La route server-side che effettua le chiamate all'AI usa
-- invece la Service Role Key di Supabase (mai esposta al browser) per
-- poter leggere questa riga anche se l'utente collegato non è admin.
drop policy if exists "ai_settings admin only" on public.ai_settings;
create policy "ai_settings admin only" on public.ai_settings
  for all using (public.is_app_admin()) with check (public.is_app_admin());
