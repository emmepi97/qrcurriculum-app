# QR Curriculum - V15 completo

Versione completa ricostruita dal bundle inviato, con modifiche richieste:

- dashboard con anteprima CV sempre visibile a sinistra durante la compilazione;
- auto-fit A4 per mantenere il CV/PDF su una sola pagina;
- CTA consulenza gratuita sotto Scarica PDF, tracking click, pagina dedicata e form consulenza CV senza prezzo esposto;
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

## V23.1 Regression Fix
- Rimosse di nuovo le route Directory, CV multipli e Monetization.
- Rimosse dal menu logged-in le voci Directory, CV multipli e Monetization.
- Ripristinata visibilità forte del campo Job Match con textarea grande, evidente e non ridimensionabile.
- Privacy e Cookie spostate nel footer home.
- Cookie banner e cookie_settings gestibile da admin aggiunti.


## Dominio pubblico corretto

Per evitare link tipo `qrcurriculum-app.vercel.app`, su Vercel imposta una di queste variabili ambiente con il tuo dominio reale:

```env
NEXT_PUBLIC_SITE_URL=https://www.tuodominio.it
```

In alternativa puoi usare:

```env
NEXT_PUBLIC_PUBLIC_BASE_URL=https://www.tuodominio.it
NEXT_PUBLIC_APP_URL=https://www.tuodominio.it
```

Dopo averla aggiunta devi fare un nuovo Redeploy. La dashboard, il QR code e il profilo pubblico useranno sempre questo dominio.

## V19 - Monetizzazione reale

Questa versione introduce:

- Job Match gratuito con solo punteggio visibile agli utenti free.
- Dettaglio Job Match Premium: skill trovate, keyword mancanti, aree di miglioramento e suggerimenti.
- Export Prompt AI Premium: genera un prompt completo da usare su ChatGPT senza costi API per la piattaforma.
- Benchmark Premium con profili simili: categorizza i job title/job description in famiglie professionali tramite keyword.
- Application Tracker: pagina per aggiungere, monitorare e gestire le candidature.

### SQL da eseguire
Eseguire `supabase/migration_v19_business_features.sql` una volta nel SQL Editor di Supabase.

### Premium
Un utente viene considerato Premium se in `subscriptions` ha:

```text
plan = premium
```

oppure

```text
status = active
```



## V21 - Homepage platform positioning

- Homepage expanded to communicate ATS-friendly CV creation, QR/visit analytics, Skill Radar and online portfolio.
- Added six feature cards, stronger section hierarchy, and a clearer closing call to action.
- Fixed the hero title so line breaks render as JSX instead of displaying literal HTML tags.
- Existing application routes, Supabase migrations and CV template files are preserved.


## V22 - Homepage redesign

- Header preserved as requested.
- Redesigned the rest of the homepage with a consistent dark cosmic visual system and improved text contrast.
- Replaced text-heavy feature cards with four concise feature cards and custom CSS/SVG mini-graphics.
- Added lightweight CSS animations with `prefers-reduced-motion` support.
- Kept existing app routes, data logic, Supabase migrations, and CV template files unchanged.


## V23 - Navigation active-state fix

- Removed the V20 CSS fallback that styled the Radar Skill item based on the presence of a navigation link rather than the current route.
- Kept the shared `AppTopbar` route-aware `isActive(pathname)` logic, so the active item is based on the current route.
- Homepage V22 redesign and CV template are preserved.
