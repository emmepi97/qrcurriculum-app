'use client';
import { useLayoutEffect, useRef, useState, useCallback } from 'react';

/**
 * useAutoFitA4
 * ------------------------------------------------------------------
 * Motore "Canva-style" che garantisce che il CV stia SEMPRE in una
 * sola pagina A4, qualunque sia la quantità di contenuto:
 *
 *   1. Il foglio (`sheetRef`) ha un'altezza fissata solo dal rapporto
 *      A4 (aspect-ratio: 210 / 297), MAI da px/mm fissi nel markup.
 *   2. Il contenuto (`contentRef`) cresce liberamente (height: auto).
 *   3. Ad ogni render/resize misuriamo l'altezza reale del contenuto
 *      e la confrontiamo con l'altezza disponibile del foglio.
 *   4. Se il contenuto è più alto del foglio, riduciamo un unico
 *      fattore di scala (--cv-scale) con una ricerca binaria: questo
 *      fattore pilota in CvTemplate.module.css font-size, line-height,
 *      margin, padding, gap e dimensione di foto/QR in modo
 *      proporzionale, così tutto si restringe insieme, mai un pezzo
 *      isolato, e il contenuto non viene MAI tagliato né spinto su
 *      una seconda pagina.
 *
 * Lo stesso identico nodo/scala viene poi catturato per il PDF
 * (vedi lib/exportCvPdf.js), quindi anteprima e PDF combaciano
 * sempre pixel per pixel.
 */

const MAX_SCALE = 1;
const MIN_SCALE = 0.32; // soglia di leggibilità minima prima di fermare la ricerca
const SEARCH_STEPS = 22; // precisione della ricerca binaria (>> sufficiente)

export default function useAutoFitA4(watchKey) {
  const sheetRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [ready, setReady] = useState(false);

  const fits = useCallback((testScale) => {
    const content = contentRef.current;
    const sheet = sheetRef.current;
    if (!content || !sheet) return true;
    content.style.setProperty('--cv-scale', String(testScale));
    // scrollHeight riflette l'altezza reale del contenuto dopo lo scaling
    return content.scrollHeight <= sheet.clientHeight + 0.5;
  }, []);

  const measure = useCallback(() => {
    const sheet = sheetRef.current;
    const content = contentRef.current;
    if (!sheet || !content) return;
    if (!sheet.clientHeight) return;

    // Percorso veloce: il contenuto entra già a scala piena.
    if (fits(MAX_SCALE)) {
      setScale(MAX_SCALE);
      setReady(true);
      return;
    }

    // Il contenuto NON entra a scala piena: cerchiamo con ricerca
    // binaria la scala più grande possibile che comunque lo fa stare
    // in una sola pagina, senza mai tagliarlo.
    let lo = MIN_SCALE;
    let hi = MAX_SCALE;
    let best = MIN_SCALE;

    for (let i = 0; i < SEARCH_STEPS; i++) {
      const mid = (lo + hi) / 2;
      if (fits(mid)) {
        best = mid;
        lo = mid;
      } else {
        hi = mid;
      }
    }

    fits(best);
    setScale(best);
    setReady(true);
  }, [fits]);

  useLayoutEffect(() => {
    measure();

    const ro = new ResizeObserver(() => measure());
    if (sheetRef.current) ro.observe(sheetRef.current);
    if (contentRef.current) ro.observe(contentRef.current);

    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measure, watchKey]);

  return { sheetRef, contentRef, scale, ready, remeasure: measure };
}
