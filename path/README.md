# QR Curriculum - V12 Skill Categories + CV Autoload

Versione basata sulla V11 con due correzioni principali richieste.

## Modifiche principali

1. Nuove categorie skill in inglese, ridotte e internazionali:
   - Leadership & Management
   - Operations
   - Project Management
   - Data & Analytics
   - Technology
   - Engineering
   - Finance & Business
   - Sales & Marketing
   - Communication
   - Supply Chain
   - Quality & Improvement
   - Industry Expertise

2. Radar Skill aggiornato sulle nuove 12 categorie.

3. Conversione automatica delle vecchie categorie tramite migration SQL.

4. Anni di esperienza skill calcolati automaticamente dalla `Data acquisizione` della competenza.
   - Non viene aggiunto un campo manuale.
   - Il valore mostrato nel CV e nel radar viene aggiornato automaticamente in base alla data corrente.

5. Correzione caricamento CV automatico:
   - all'apertura dashboard il CV carica in background tutte le sezioni;
   - non serve piu cliccare piano piano su Esperienze, Formazione, Lingue, Competenze, Premi, Progetti e Case Study per completare l'anteprima;
   - l'editor resta lazy/veloce, ma i dati del CV vengono caricati subito in background.

## Restano incluse le funzioni precedenti

- Layout preview V11 con zoom e schermo intero.
- Analytics Premium con trial 30 giorni.
- Recensioni solo da utenti registrati/loggati.
- Disponibilita professionale.
- Directory base.
- AI Tools / Job Match Score base.
- CV multipli predisposti.
- Nessuna verifica competenze e nessun badge portfolio verificato.

## Deploy

1. Sostituisci tutti i file con quelli di questo ZIP.
2. Esegui su Supabase `supabase/migration_v12_skill_categories.sql`.
3. Se non avevi ancora eseguito le migration precedenti, esegui prima V8 e V10.
4. Redeploy su Vercel.
