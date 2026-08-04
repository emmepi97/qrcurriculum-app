'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import QRCode from 'qrcode';
import supabase from '@/lib/supabaseClient';
import { computeWorkerScore, makePublicUrl, makeQrUrl } from '@/lib/helpers';
import CvTemplate from '@/components/cv/CvTemplate';
import PortfolioView from '@/components/portfolio/PortfolioView';
import { exportCvPdf } from '@/lib/exportCvPdf';
import { LanguageToggle, useLang } from '@/components/LanguageProvider';
import ConsultationCTA from '@/components/ConsultationCTA';

export default function PublicQrCvPage() {
  const { slug } = useParams();
  const params = useSearchParams();
  const { t, setLang, lang } = useLang();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const tracked = useRef(false);
  const cvRef = useRef(null);

  useEffect(() => {
    const urlLang = params.get('lang');
    if (urlLang === 'en' || urlLang === 'it') setLang(urlLang);
  }, [params, setLang]);

  useEffect(() => {
    async function load() {
      try {
        const { data: p, error: e } = await supabase.from('personal_info').select('*').eq('public_slug', slug).eq('is_public', true).maybeSingle();
        if (e || !p) { setError(t.profileNotFound); setLoading(false); return; }
        const next = { personal_info: p };
        const tables = ['work_experiences', 'educations', 'languages', 'skills', 'awards', 'projects', 'case_studies'];
        const results = await Promise.all(tables.map(async table => {
          const { data: rows } = await supabase.from(table).select('*').eq('user_id', p.user_id).eq('is_hidden', false).order('created_at', { ascending: false });
          return [table, rows || []];
        }));
        results.forEach(([table, rows]) => next[table] = rows);
        const { data: av } = await supabase.from('professional_availability').select('*').eq('user_id', p.user_id).maybeSingle();
        next.professional_availability = av;
        const { data: reviews } = await supabase.from('portfolio_reviews').select('*').eq('owner_user_id', p.user_id).eq('status', 'approved').eq('consent_publication', true).order('created_at', { ascending: false });
        next.portfolio_reviews = reviews || [];
        setData(next);
        QRCode.toDataURL(makeQrUrl(slug), { width: 180, margin: 1 }).then(setQrCode);
        if (!tracked.current) {
          tracked.current = true;
          const base = {
            profile_user_id: p.user_id,
            public_slug: slug,
            path: typeof window !== 'undefined' ? window.location.pathname : '',
            referrer: typeof document !== 'undefined' ? document.referrer : '',
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
          };
          const track = (eventType) => fetch('/api/track-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...base, event_type: eventType })
          }).then(r => r.json()).then(r => { if (!r.ok) console.error(`Analytics tracking error (${eventType}):`, r.error); })
            .catch(err => console.error(`Analytics tracking error (${eventType}):`, err.message));
          track('profile_view');
          if (params.get('qr') === '1') track('qr_scan');
        }
      } catch (e) {
        setError(e?.message || t.profileNotFound);
      } finally {
        setLoading(false);
      }
    }
    if (slug) load();
  }, [slug, params, t.profileNotFound]);

  const worker = useMemo(() => data ? computeWorkerScore(data) : null, [data]);
  const publicUrl = useMemo(() => makePublicUrl(slug, lang), [slug, lang]);

  async function downloadPdf() {
    await exportCvPdf(cvRef.current, `CV-${data?.personal_info?.nome || 'online'}.pdf`);
  }

  if (loading) return <p className="pageWrap">{t.loading}</p>;
  if (error) return <p className="pageWrap error">{error}</p>;

  return (
    <main className="publicPage">
      <div className="publicActions">
        <LanguageToggle />
        <button className="btn primary" onClick={downloadPdf}>{t.downloadPdf}</button>
        <ConsultationCTA userId={data?.personal_info?.user_id} email={data?.personal_info?.email_cv} source="public_cv" />
      </div>

      <PortfolioView data={data} qrCode={qrCode} lang={lang} worker={worker} publicUrl={publicUrl} />

      {/* CV renderizzato fuori schermo: serve solo per generare il PDF scaricabile,
          il portfolio pubblico mostrato sopra non è più una copia del CV. */}
      <div style={{ position: 'absolute', left: '-99999px', top: 0, width: '210mm' }} aria-hidden="true">
        <CvTemplate ref={cvRef} data={data} qrCode={qrCode} forcedLang={lang} />
      </div>
    </main>
  );
}
