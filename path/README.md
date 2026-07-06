# CV Online Supabase V4

Versione completa con fix link pubblico: in produzione non viene più mostrato `localhost:3000`.

## Fix V4

Il link pubblico viene calcolato così:

1. se `NEXT_PUBLIC_SITE_URL` è configurata e non contiene localhost, usa quella;
2. altrimenti, lato browser usa `window.location.origin`, cioè il dominio reale Vercel;
3. solo in sviluppo locale usa `http://localhost:3000`.

## Variabile Vercel importante

Su Vercel imposta:

```env
NEXT_PUBLIC_SITE_URL=https://nome-progetto.vercel.app
```

Poi fai redeploy.

## Setup

1. Crea progetto Supabase.
2. Esegui `supabase/schema.sql` nel SQL Editor.
3. Abilita Email Auth.
4. Deploy su Vercel con variabili ambiente.
