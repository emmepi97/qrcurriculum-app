# QR Curriculum - V8 completa

Questa versione include tutte le modifiche richieste:

- Ripristino categorie Radar Skill al vecchio sistema: Digital, Gestione Progetti, Comunicazione, Leadership, Tecniche di Settore, Analisi & Problem Solving, Creatività & Design, Altro.
- Traduzione completa IT/EN di home, dashboard, CV pubblico, analytics, radar skill, login, pulsanti e testi principali.
- CV pubblico coerente con la lingua selezionata.
- Portfolio/CV IT ed EN gestibili come versioni separate tramite campo lingua contenuto su ogni elemento.
- Salvataggi più leggeri: dopo il salvataggio viene ricaricata solo la sezione modificata, non tutta la dashboard.
- Gestione errori Supabase/Fetch più robusta per ridurre i blocchi tipo `TypeError: Load failed`.
- Salvataggio senza riportare la pagina in alto.
- Flag di visibilità CV per ogni elemento e per i singoli campi principali.
- Per le skill è possibile nascondere il punteggio sul CV.
- Blocco competenze ordinato alfabeticamente.
- CV migliorato graficamente, con bordo destro visibile e layout A4 più stabile.
- Premio formattato come `Ambassador - Valentino`, con ente accanto al titolo.
- Radar Skill con radar sopra, competenze sotto e spiegazione chiara dei videocorsi consigliati.
- Testo sotto QR code: `Ho reso il mio CV interattivo. Scansiona per vedere il mio portfolio completo.`

## Deploy

1. Sostituisci i file del progetto con quelli di questo ZIP.
2. Su Supabase esegui `supabase/migration_v8_incrementale.sql` se hai già il database.
3. Se parti da zero, esegui `supabase/schema.sql`.
4. Verifica variabili su Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL=https://qrcurriculum-app.vercel.app`
5. Redeploy.
