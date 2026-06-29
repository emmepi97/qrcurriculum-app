# CV Online + Supabase + Vercel

Questo progetto ti permette di avere il tuo CV sempre online, modificabile da dashboard e generabile in PDF ogni volta che vuoi. I dati non stanno in locale: vengono salvati in Supabase. Il sito viene pubblicato su Vercel.

## Cosa include

- Login con Supabase Auth.
- Dashboard privata per modificare dati personali, esperienze, formazione, lingue, competenze, premi, progetti e case study.
- CV pubblico con URL tipo `/cv/matteo-poggesi-123456`.
- QR code automatico verso il CV pubblico.
- Download PDF lato browser con `html2pdf.js`.
- Template CV compatto ispirato al tuo `cv_simple.html`.

## 1. Crea progetto Supabase

Vai su Supabase, crea un nuovo progetto e poi apri:

`SQL Editor` → `New query`

Incolla tutto il contenuto del file:

`supabase/schema.sql`

Poi clicca `Run`.

## 2. Configura Authentication

In Supabase vai su:

`Authentication` → `Providers` → `Email`

Abilita Email authentication. Per iniziare puoi disabilitare la conferma email, così puoi registrarti subito.

## 3. Crea progetto Vercel

Carica questa cartella su GitHub e poi importa il repository su Vercel.

Su Vercel aggiungi queste variabili ambiente:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=https://tuo-progetto.vercel.app
```

Le prime due le trovi in Supabase:

`Project Settings` → `API`

## 4. Avvio locale facoltativo

Se vuoi provarlo prima in locale:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Poi apri:

`http://localhost:3000`

## 5. Uso online

Una volta deployato:

- vai su `/login`
- registrati
- compila la dashboard
- clicca anteprima CV
- clicca scarica PDF

Il tuo CV pubblico sarà raggiungibile dallo slug generato nella dashboard.
