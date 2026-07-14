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

## V18 CSS/Layout Upgrade
- Revisione CSS system-wide con design token, card più leggere, spaziature coerenti e focus states.
- Dashboard più ordinata con editor a sinistra e anteprima CV a destra su desktop, sotto da tablet/mobile.
- Responsive migliorato per topbar/hamburger, form, tab, hero, analytics, radar, job match e consultation.
- Radar Skill più stabile da mobile e breakdown Index più leggibile.
- Job Match textarea non ridimensionabile e layout più pulito.
- Consultation trasformata in landing più chiara e mobile-first.
- Pagine Directory, CV multipli e Monetization rimosse dal progetto/menu per MVP più focalizzato.
- Professional Index senza Platform Activity: 15% Profile Foundation + 30% Skill Strength + 15% Skill Coverage + 20% Experience Evidence + 10% Reputation Score + 10% Skill Rarity Bonus.


## V19 Web Portfolio
- La pagina pubblica `/qrcv/[slug]` non è più solo un CV A4: diventa un vero portfolio web personale.
- Aggiunto campo `video_url` al profilo personale e alla dashboard.
- Il portfolio pubblico mostra hero personale, video YouTube/Vimeo incorporato, Professional Index, radar skill, esperienze, progetti, case study, formazione, lingue, premi e recensioni.
- Il CV PDF resta disponibile come download tramite rendering nascosto del template CV.
- Migration/schema aggiornati con `personal_info.video_url`.


## V20 Portfolio polish
- Portfolio pubblico ottimizzato come pagina web semplice ma più accattivante.
- Aggiunti KPI hero: competenze, esperienze, progetti e review.
- Aggiunta sezione Chi sono, Top Skill, Skill differenzianti, timeline esperienze e progetti in card.
- Mobile-first: griglie a una colonna, bottoni full-width, timeline verticale e video responsive.


## V21 Admin + Consultation Upgrade
- Pannello admin completamente ripensato: sidebar con aree funzionali, nomi leggibili, descrizioni, KPI e card record.
- Form admin più chiaro, con labels comprensibili e gestione per area: consulenze, profili, licenze, disponibilità, review, CV e Job Match.
- Pagina consulenza migliorata con hero più chiaro, value proposition, processo e form più guidato.
- Responsive mobile migliorato per admin e consulenza.
