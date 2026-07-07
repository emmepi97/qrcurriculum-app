# QR Curriculum - ZIP completa fix richiesti

## Cosa contiene
- App Next.js completa con dashboard, profilo pubblico, analytics, radar skill e CV PDF.
- Fix eliminazione esperienze/elementi.
- Fix URL immagine profilo con anteprima e fallback.
- Pulsante “Salva dati” spostato in fondo al form informazioni personali.
- Salvataggi senza riportare la pagina in alto: viene preservata la posizione di scroll.
- Versione IT/EN con selettore lingua persistente.
- Competenze: ricerca dal catalogo globale prima di aggiungere una nuova skill.
- CV: le competenze mostrano solo nome e voto, senza categoria.
- Possibilità di nascondere solo descrizione dal CV senza nascondere l’intero elemento.
- Date migliorate con intervallo inizio-fine.
- Fix analytics `profile_user_id` tramite SQL incrementale.
- Categorie skill più specifiche/professionali.
- Radar skill sopra e lista skill sotto, con punteggio utente, suggerimenti smart e videocorsi consigliati.

## Deploy rapido
1. Sostituisci i file del progetto con questi.
2. Su Supabase esegui prima `supabase/migration_v7_incrementale.sql`.
3. Su Vercel verifica le variabili:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL=https://qrcurriculum-app.vercel.app`
4. Redeploy.

## Nota importante
Se parti da un database vuoto puoi eseguire `supabase/schema.sql`. Se hai già dati, usa solo la migration incrementale.
