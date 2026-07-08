# QR Curriculum - V9 Speed

Questa versione parte dalla V8 e aggiunge ottimizzazioni mirate alla velocita.

## Cosa cambia rispetto alla V8

- Dashboard in modalita lazy: all apertura carica solo informazioni personali, QR e catalogo skill.
- Le sezioni Esperienze, Formazione, Lingue, Competenze, Premi, Progetti e Case Study si caricano solo quando vengono aperte.
- Dopo il salvataggio viene aggiornata solo la sezione modificata, non tutto il profilo.
- Anteprima CV alleggerita: non forza il caricamento completo di tutte le sezioni.
- Pulsante `Aggiorna anteprima completa` per caricare tutte le sezioni solo quando serve davvero.
- QR code generato con piccolo debounce per evitare rigenerazioni continue mentre si modifica lo slug.
- CvTemplate memoizzato per ridurre render inutili.
- Query sezioni eseguite in parallelo solo quando serve anteprima completa.
- Indici SQL gia presenti nella migration V8 per velocizzare letture per user_id e created_at.

## Deploy

1. Sostituisci i file del progetto con quelli dello ZIP.
2. Se hai gia eseguito `supabase/migration_v8_incrementale.sql`, non devi rieseguirla.
3. Se non hai ancora aggiornato il database, esegui `supabase/migration_v8_incrementale.sql`.
4. Redeploy su Vercel.

## Nota

Questa versione privilegia la velocita della dashboard. L anteprima CV mostra subito i dati gia caricati; per vedere tutto il CV completo clicca `Aggiorna anteprima completa`.
