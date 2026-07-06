# QR Curriculum V6 - Modern Home, Analytics, Radar Skill, Responsive

## Dove si trova Radar Skill

La pagina Radar Skill è qui:

```text
/radar-skill
```

Dentro la dashboard trovi anche il link in alto nella navbar:

```text
Dashboard → Radar Skill
```

## Funzionalità incluse

- Home page moderna, responsive e più completa.
- Privacy Policy: `/privacy-policy`.
- Cookie Policy: `/cookie-policy`.
- Profilo pubblico nel formato: `/qrcv/nomeutente`.
- QR code tracciato: `/qrcv/nomeutente?qr=1`.
- Pagina Analytics: `/analytics`.
- Pagina Radar Skill: `/radar-skill`.
- Skill con rating da 1 a 5.
- Skill con macrocategoria obbligatoria tra 8 categorie bloccate.
- Catalogo globale skill popolato automaticamente dalle skill inserite dagli utenti.
- Layout responsive per desktop, tablet e smartphone.

## Deploy

1. Esegui su Supabase `supabase/schema.sql` se parti da zero.
2. Se hai già il database esistente, esegui `supabase/migration_v5_incrementale.sql`.
3. Su Vercel imposta:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=https://qrcurriculum-app.vercel.app
```

4. Fai Redeploy.
