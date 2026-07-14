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

## Modifica menu responsive
Questa versione aggiorna `components/AppTopbar.jsx` e `app/globals.css`.

### Cosa cambia
- Menu desktop più ordinato, diviso in gruppi: navigazione principale, funzioni secondarie e azioni utente.
- Menu mobile/tablet con hamburger e drawer laterale.
- Evidenziazione automatica della pagina attiva.
- Chiusura del menu mobile al cambio pagina, con click fuori dal menu o tasto ESC.

### Come impostare un admin
Esegui su Supabase SQL Editor:

```sql
insert into public.app_admins(email)
values ('tua@email.com')
on conflict do nothing;
```

In alternativa puoi autorizzare più email da variabile ambiente su Vercel:

```txt
NEXT_PUBLIC_ADMIN_EMAILS=tua@email.com,altra@email.com
```

L'utente deve poi accedere con la stessa email usata in Supabase Auth.

## V23 Menu mobile + Cookie Manager
- Privacy Policy e Cookie Policy spostate nel footer della home.
- Menu landing alleggerito: restano lingua e login, non le policy.
- Aggiunto cookie banner con popup preferenze, pulsante Accetta tutti, Solo essenziali e Salva preferenze.
- Aggiunto pulsante Gestisci cookie nel footer e floating button sempre disponibile dopo la scelta.
- Aggiunta tabella `cookie_settings` gestibile da Admin tramite sezione `cookie_settings`.
- Menu logged-in ottimizzato da telefono forzando hamburger sotto 1180px.
