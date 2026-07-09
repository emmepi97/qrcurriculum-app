# QR Curriculum - V13 Full Page CV Editor + PDF/Analytics/Radar Fix

Versione basata sul bundle ricevuto, con le modifiche richieste.

## Modifiche V13

1. **Editor CV full page**
   - La dashboard non è più compressa in due colonne strette.
   - Editor e anteprima occupano tutta la larghezza disponibile.
   - Migliorata la resa su schermi piccoli e medi.

2. **PDF CV pulito e massimo 1 pagina**
   - Rimosso bordo/margine estetico dal template PDF esportato.
   - Il PDF usa un template nascosto dedicato, compatto e senza box-shadow/bordo.
   - Prima dell’export il contenuto viene misurato e scalato per stare in una pagina A4.
   - Rimane impostato `margin: 0` in html2pdf/jsPDF.

3. **Spiegazione algoritmo Radar Skill**
   - Inserito box chiaro nella pagina Radar Skill.
   - Formula spiegata: media rating skill + copertura categorie + bilanciamento.
   - Radar più grande e leggibile.

4. **Categorie skill in inglese/internazionali**
   - Confermate le 12 categorie internazionali già presenti:
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

5. **Statistiche/Analytics sistemate**
   - La pagina Analytics ora carica prima le statistiche base anche se la tabella `subscriptions` non è pronta.
   - Aggiunto pulsante “Aggiorna statistiche”.
   - Aggiunta spiegazione di come vengono conteggiate visite e scansioni QR.
   - Migliorati i messaggi di errore per capire quale migration manca.

6. **Radar Skill più leggibile**
   - Grafico SVG più grande.
   - Etichette abbreviate per evitare sovrapposizioni.
   - Dettaglio categorie in card a griglia.

7. **Rimosso testo/popup videocorsi automatici**
   - Tolto il box con la frase: “I videocorsi sono suggerimenti automatici...” dalla pagina Radar Skill.

8. **Struttura a pagamento più chiara**
   - Aggiunta spiegazione nella sezione Monetizzazione:
     - Free: CV pubblico, QR code, totali base analytics.
     - Premium: analytics avanzati, CV multipli, directory, recensioni portfolio.
     - Stripe ancora non collegato: per ora piano/stato si gestiscono da Supabase.

## Deploy

1. Sostituisci tutti i file del progetto con quelli di questo ZIP.
2. Se non lo hai già fatto, esegui in Supabase:
   - `supabase/migration_v8_incrementale.sql`
   - `supabase/migration_v10_monetization.sql`
   - `supabase/migration_v12_skill_categories.sql`
3. Redeploy su Vercel.

## Nota importante sulle Analytics

Le statistiche vengono registrate quando un utente apre il profilo pubblico `/qrcv/slug`. Le scansioni QR vengono registrate quando il profilo viene aperto con parametro `?qr=1`, cioè usando il link generato nel QR code.
