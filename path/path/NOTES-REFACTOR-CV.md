# Note sul refactor — CSS modulare + CV "stile Canva"

## 1. CSS riorganizzato

`app/globals.css` ora è solo un indice di `@import`. Le regole vere sono
divise per dominio dentro `/styles`:

| File | Contenuto |
|---|---|
| `variables.css` | colori, ombre, bordi (design tokens) |
| `base.css` | reset HTML/body |
| `buttons.css` | bottoni, stati (errore/successo), utility |
| `marketing.css` | landing page pubblica |
| `auth-legal.css` | login/registrazione, pagine legali |
| `dashboard-shell.css` | topbar, hero, layout workspace |
| `forms.css` | form ed elenchi editor sezioni |
| `cv-editor-preview.css` | riquadro/zoom dell'anteprima CV nella dashboard |
| `public-page.css` | chrome della pagina pubblica `/qrcv/[slug]` |
| `modal.css` | modale di anteprima a schermo intero |
| `analytics-admin.css` | analytics, radar skill, monetizzazione, admin, tour |
| `print.css` | fallback per Ctrl+P dal browser (non usato per l'export) |
| `responsive.css` | breakpoint tablet/mobile della sola shell app |

Il **foglio CV non è più qui dentro**: vive isolato in
`components/cv/CvTemplate.module.css` (CSS Module), così nessuna
modifica al tema dell'app può mai alterare l'aspetto del CV o del PDF.

## 2. Il nuovo motore CV (`components/cv/`)

- **`CvTemplate.jsx`** — markup del CV, diviso in sotto-componenti
  leggibili (`CvHeader`, `CvSection`, `CvEntry`). Espone il nodo DOM
  del foglio tramite `ref` (niente più `id` duplicati nel documento).
- **`CvTemplate.module.css`** — un foglio bianco A4 (`aspect-ratio: 210/297`,
  unica misura "fissa" ammessa), senza bordo/ombra/card. Tutte le altre
  misure sono `%`, `em`, `rem`, `clamp()` e **container query (`cqw`)**:
  ogni elemento è proporzionale alla larghezza reale del foglio in quel
  contesto (sidebar stretta, pagina pubblica larga, cattura PDF), non
  alla larghezza della finestra del browser.
- **`lib/useAutoFitA4.js`** — l'algoritmo "shrink to fit": misura
  l'altezza reale del contenuto, la confronta con l'altezza del foglio
  A4 e, se serve, riduce con ricerca binaria un unico fattore
  `--cv-scale` che pilota in blocco font-size, line-height (proporzionale
  al font-size), margini, padding, gap e dimensione di foto/QR. Il
  contenuto non viene mai tagliato e non genera mai una seconda pagina:
  si restringe finché non entra in una sola pagina A4.
- **`lib/exportCvPdf.js`** — cattura in PDF **lo stesso identico nodo**
  che l'utente vede a schermo (stessa scala già calcolata da
  `useAutoFitA4`). Non esiste più un clone nascosto con regole CSS
  diverse: anteprima e PDF sono garantiti identici perché sono la
  stessa vista.

## 3. Cosa verificare dopo il primo `npm install && npm run dev`

- Compilare qualche CV con contenuti molto lunghi (10+ esperienze, tante
  skill) e controllare che il foglio si "restringa" invece di tagliare
  o sforare su una seconda pagina.
- Confrontare visivamente anteprima e PDF scaricato: dovrebbero
  combaciare esattamente, sia nella sidebar sia nella modale a schermo
  intero.
- Testare su schermi stretti (mobile) che header e QR non si
  sovrappongano mai e che le pillole di lingue/skill vadano a capo.
