'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import QRCode from 'qrcode';
import supabase from '@/lib/supabaseClient';
import { makeQrUrl } from '@/lib/helpers';
import CvTemplate from '@/components/CvTemplate';
import { LanguageToggle, useLang } from '@/components/LanguageProvider';

export default function PublicQrCvPage() {
  const { slug } = useParams();
  const params = useSearchParams();
  const { t, setLang, lang } = useLang();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [qrCode, setQrCode] = useState('');

  const tracked = useRef(false);

  useEffect(() => {
    const urlLang = params.get('lang');

    if (urlLang === 'en' || urlLang === 'it') {
      setLang(urlLang);
    }
  }, [params, setLang]);

  useEffect(() => {
    async function load() {
      try {
        const { data: p, error: e } = await supabase
          .from('personal_info')
          .select('*')
          .eq('public_slug', slug)
          .eq('is_public', true)
          .maybeSingle();

        if (e || !p) {
          setError(t.profileNotFound);
          setLoading(false);
          return;
        }

        const next = {
          personal_info: p
        };

        const tables = [
          'work_experiences',
          'educations',
          'languages',
          'skills',
          'awards',
          'projects',
          'case_studies'
        ];

        const results = await Promise.all(
          tables.map(async table => {
            const { data: rows } = await supabase
              .from(table)
              .select('*')
              .eq('user_id', p.user_id)
              .eq('is_hidden', false)
              .order('created_at', { ascending: false });

            return [table, rows || []];
          })
        );

        results.forEach(([table, rows]) => {
          next[table] = rows;
        });

        const { data: av } = await supabase
          .from('professional_availability')
          .select('*')
          .eq('user_id', p.user_id)
          .maybeSingle();

        next.professional_availability = av;

        const { data: reviews } = await supabase
          .from('portfolio_reviews')
          .select('*')
          .eq('owner_user_id', p.user_id)
          .eq('status', 'approved')
          .eq('consent_publication', true)
          .order('created_at', { ascending: false });

        next.portfolio_reviews = reviews || [];

        setData(next);

        /*
          QR ridotto.
          Prima era 180.
          Ora è 95 per evitare che nel PDF occupi troppo spazio.
        */
        QRCode.toDataURL(makeQrUrl(slug), {
          width: 95,
          margin: 1
        }).then(setQrCode);

        /*
          Tracking profilo pubblico.
        */
        if (!tracked.current) {
          tracked.current = true;

          const base = {
            profile_user_id: p.user_id,
            public_slug: slug,
            path: typeof window !== 'undefined' ? window.location.pathname : '',
            referrer: typeof document !== 'undefined' ? document.referrer : '',
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
          };

          await supabase
            .from('analytics_events')
            .insert({
              ...base,
              event_type: 'profile_view'
            });

          if (params.get('qr') === '1') {
            await supabase
              .from('analytics_events')
              .insert({
                ...base,
                event_type: 'qr_scan'
              });
          }
        }
      } catch (e) {
        setError(e?.message || t.profileNotFound);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      load();
    }
  }, [slug, params, t.profileNotFound]);

  async function downloadPdf() {
    const html2pdf = (await import('html2pdf.js')).default;

    const root =
      document.getElementById('pdf-export-document') ||
      document.getElementById('cv-document');

    const page = root?.querySelector('.cv-page') || root;

    if (!root || !page) return;

    /*
      Salvo tutti gli stili originali.
      Così dopo il download li ripristino e non rovino la pagina.
    */
    const original = {
      rootWidth: root.style.width,
      rootHeight: root.style.height,
      rootOverflow: root.style.overflow,
      rootDisplay: root.style.display,
      rootJustifyContent: root.style.justifyContent,
      rootAlignItems: root.style.alignItems,
      rootBackground: root.style.background,

      pageTransform: page.style.transform,
      pageTransformOrigin: page.style.transformOrigin,
      pageWidth: page.style.width,
      pageHeight: page.style.height,
      pageMinHeight: page.style.minHeight,
      pageMaxHeight: page.style.maxHeight,
      pageOverflow: page.style.overflow,
      pageMargin: page.style.margin,
      pageBoxShadow: page.style.boxShadow,
      pageBorder: page.style.border,
      pageOutline: page.style.outline
    };

    try {
      root.classList.add('pdfExportReady');

      /*
        Il contenitore nascosto diventa esattamente una pagina A4.
        Poi usiamo flex per centrare il CV.
      */
      root.style.width = '210mm';
      root.style.height = '297mm';
      root.style.overflow = 'hidden';
      root.style.display = 'flex';
      root.style.justifyContent = 'center';
      root.style.alignItems = 'center';
      root.style.background = '#ffffff';

      /*
        La pagina CV viene pulita da bordo, ombra e outline.
      */
      page.style.transform = 'none';
      page.style.transformOrigin = 'center center';
      page.style.width = '210mm';
      page.style.height = 'auto';
      page.style.minHeight = '0';
      page.style.maxHeight = 'none';
      page.style.overflow = 'visible';
      page.style.margin = '0';
      page.style.boxShadow = 'none';
      page.style.border = 'none';
      page.style.outline = 'none';

      /*
        Aspetto due frame per permettere al browser di ricalcolare layout e dimensioni.
      */
      await new Promise(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      );

      const rootRect = root.getBoundingClientRect();
      const pageRect = page.getBoundingClientRect();

      /*
        Calcolo lo scaling.
        scaleX = quanto entra in larghezza
        scaleY = quanto entra in altezza
        Uso il valore più basso per evitare tagli.
      */
      const realPageHeight =
        page.scrollHeight ||
        pageRect.height ||
        rootRect.height;

      const scaleX = rootRect.width / pageRect.width;
      const scaleY = rootRect.height / realPageHeight;

      /*
        Massimo 1 = non ingrandisco.
        Minimo 0.52 = provo a far entrare anche CV lunghi.
      */
      const scale = Math.max(
        0.52,
        Math.min(1, scaleX, scaleY)
      );

      page.style.transform = `scale(${scale})`;
      page.style.transformOrigin = 'center center';
      page.style.width = '210mm';

      await new Promise(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      );

      await html2pdf()
        .set({
          margin: 0,
          filename: 'CV.pdf',
          image: {
            type: 'jpeg',
            quality: 0.98
          },
          pagebreak: {
            mode: ['css', 'legacy'],
            avoid: ['.item', '.section', '.qr-portfolio-block']
          },
          html2canvas: {
            scale: 2,
            useCORS: true,
            scrollX: 0,
            scrollY: 0,
            windowWidth: 1200,
            backgroundColor: '#ffffff'
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            compress: true
          }
        })
        .from(root)
        .save();

    } finally {
      /*
        Ripristino totale degli stili originali.
      */
      root.style.width = original.rootWidth;
      root.style.height = original.rootHeight;
      root.style.overflow = original.rootOverflow;
      root.style.display = original.rootDisplay;
      root.style.justifyContent = original.rootJustifyContent;
      root.style.alignItems = original.rootAlignItems;
      root.style.background = original.rootBackground;

      page.style.transform = original.pageTransform;
      page.style.transformOrigin = original.pageTransformOrigin;
      page.style.width = original.pageWidth;
      page.style.height = original.pageHeight;
      page.style.minHeight = original.pageMinHeight;
      page.style.maxHeight = original.pageMaxHeight;
      page.style.overflow = original.pageOverflow;
      page.style.margin = original.pageMargin;
      page.style.boxShadow = original.pageBoxShadow;
      page.style.border = original.pageBorder;
      page.style.outline = original.pageOutline;

      root.classList.remove('pdfExportReady');
    }
  }

  if (loading) {
    return (
      <p style={{ padding: 30 }}>
        {t.loading}
      </p>
    );
  }

  if (error) {
    return (
      <p className="error" style={{ padding: 30 }}>
        {error}
      </p>
    );
  }

  return (
    <main className="publicPage">
      <div className="publicActions">
        <LanguageToggle />

        <button
          className="btn primary"
          onClick={downloadPdf}
        >
          {t.downloadPdf}
        </button>
      </div>

      <CvTemplate
        data={data}
        qrCode={qrCode}
        forcedLang={lang}
      />

      <div
        id="pdf-export-document"
        className="pdfExportOnly"
      >
        <CvTemplate
          data={data}
          qrCode={qrCode}
          forcedLang={lang}
        />
      </div>
    </main>
  );
}
