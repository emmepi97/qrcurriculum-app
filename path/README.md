# QR Curriculum - V15 completo

Versione completa ricostruita dal bundle inviato, con modifiche richieste:

- dashboard con anteprima CV sempre visibile a sinistra durante la compilazione;
- auto-fit A4 per mantenere il CV/PDF su una sola pagina;
- CTA consulenza gratuita sotto Scarica PDF, tracking click, pagina dedicata e form consulenza CV a 25 euro;
- API route opzionale per notifica email admin tramite Resend (`RESEND_API_KEY`, `ADMIN_NOTIFICATION_EMAIL`);
- pannello Admin con gestione consulenze e monitoraggio utenti/profili;
- analytics caricata con query limitata e indici migration;
- menu coerente su tutte le pagine principali;
- Radar Skill scaricabile in PDF con dati persona, punteggio lavoratore e skill;
- Job Match Score migliorato con CTA IT/EN;
- sezioni Monetization, Directory e CV multipli rese più chiare.

## Dopo la sostituzione
1. `npm install`
2. Esegui su Supabase `supabase/migration_v15_consulting_worker_score.sql`
3. Aggiungi admin:
   `insert into public.app_admins(email) values ('tua@email.com') on conflict do nothing;`
4. Opzionale email:
   - `RESEND_API_KEY`
   - `ADMIN_NOTIFICATION_EMAIL`
   - `NEXT_PUBLIC_ADMIN_NOTIFICATION_EMAIL`
5. `npm run dev` o redeploy Vercel.
