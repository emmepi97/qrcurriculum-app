# QR Curriculum - V10 Monetization

Versione basata sulla V9 Speed con funzionalita orientate alla monetizzazione.

## Incluso

- Trial analytics premium 30 giorni.
- Paywall logico: dopo il trial l'utente vede solo analytics base, salvo piano Premium attivo.
- Prezzo configurato lato UI: 2,99 euro/mese.
- Tabella `subscriptions` predisposta per Stripe o attivazione manuale da database.
- Sezione recensioni/referenze: il proprietario genera un link richiesta recensione.
- Chi scrive la recensione deve essere registrato e loggato al sito.
- Il proprietario approva/nasconde/elimina le recensioni prima della pubblicazione.
- Recensioni approvate visibili nel CV/portfolio pubblico.
- Disponibilita professionale nel portfolio.
- AI Tools base con Job Match Score rule-based senza API esterne.
- Directory pubblica base dei profili che hanno scelto di comparire.
- CV multipli predisposti come tabella e pagina gestionale base.

## Escluso come richiesto

- Nessuna verifica competenze.
- Nessun badge portfolio verificato.
- Nessuna gestione certificati/evidenze skill.

## Deploy

1. Sostituisci i file con questo ZIP.
2. Esegui su Supabase `supabase/migration_v10_monetization.sql`.
3. Se non avevi ancora eseguito la V8, esegui prima `supabase/migration_v8_incrementale.sql`.
4. Redeploy su Vercel.

## Attivazione Premium manuale per test

Per testare il premium senza Stripe:

```sql
update public.subscriptions
set plan='premium', status='active', current_period_end=now()+interval '30 days'
where user_id='USER_ID';
```
