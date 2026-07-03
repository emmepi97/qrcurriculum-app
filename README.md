# CV Online + Supabase + Vercel - V2

Questa versione risolve l'errore `invalid input syntax for type date: ""`, migliora homepage e dashboard, aggiunge un tour guidato al primo accesso e rende l'inserimento dati più semplice.

## Deploy rapido

1. Crea un progetto Supabase.
2. Vai su `SQL Editor` e incolla tutto il file `supabase/schema.sql`.
3. Abilita `Authentication > Providers > Email`.
4. Carica il progetto su GitHub.
5. Importa la repository su Vercel.
6. Aggiungi le variabili ambiente:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
NEXT_PUBLIC_SITE_URL=https://nome-progetto.vercel.app
```

## Pagine

- `/` homepage chiara
- `/login` accesso/registrazione
- `/dashboard` gestione CV con tour e anteprima
- `/cv/[slug]` CV pubblico

## Fix principale

Supabase non accetta stringhe vuote `""` nei campi `date`. La V2 converte automaticamente le date vuote in `null`, sia per i dati personali sia per tutte le sezioni del CV.
