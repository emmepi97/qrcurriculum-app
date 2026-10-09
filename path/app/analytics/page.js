'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import { useLang } from '@/components/LanguageProvider';
import AppTopbar from '@/components/AppTopbar';

function dayKey(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function pct(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [serviceRoleConfigured, setServiceRoleConfigured] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState('');
  const [rangeDays, setRangeDays] = useState(30);
  const [exportingPdf, setExportingPdf] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/login?next=/analytics');
        return;
      }
      setSession(data.session);
    });
  }, [router]);

  useEffect(() => {
    if (session?.user?.id) load();
  }, [session?.user?.id, rangeDays]);

  async function load() {
    try {
      setLoading(true);
      setError('');
      const uid = session.user.id;

      const { data: profileData } = await supabase
        .from('personal_info')
        .select('user_id,public_slug,nome,cognome,job_title')
        .eq('user_id', uid)
        .maybeSingle();
      setProfile(profileData || null);

      let { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();
      if (!sub) {
        // Ogni utente deve avere una riga subscription con trial attivo:
        // senza questa riga il sistema pensava che il trial fosse sempre
        // scaduto e mostrava il paywall a chiunque, anche a chi si era
        // appena iscritto.
        const { data: created } = await supabase
          .from('subscriptions')
          .insert({ user_id: uid })
          .select('*')
          .single();
        sub = created || null;
      }
      setSubscription(sub || null);

      const since = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000).toISOString();
      // Lettura tramite route server-side (Service Role Key): evita del
      // tutto eventuali disallineamenti tra RLS e struttura reale della
      // tabella, che in passato causavano risultati vuoti.
      const res = await fetch('/api/analytics-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: session.access_token, range_days: rangeDays })
      });
      const summary = await res.json();
      if (!res.ok) throw new Error(summary.error || 'Errore nel caricamento degli analytics');
      setEvents(summary.events || []);
      setServiceRoleConfigured(summary.serviceRoleConfigured !== false);
    } catch (e) {
      setError(`${e.message}. Se non vedi dati, verifica di aver eseguito migration_v18_fix_owner_id.sql e di aver impostato SUPABASE_SERVICE_ROLE_KEY nelle variabili d'ambiente.`);
    } finally {
      setLoading(false);
    }
  }

  const hasPremium = subscription && (
    subscription.status === 'trialing' ||
    subscription.status === 'active' ||
    subscription.plan === 'premium' ||
    (subscription.trial_ends_at && new Date(subscription.trial_ends_at) > new Date())
  );

  const stats = useMemo(() => {
    const views = events.filter(e => e.event_type === 'profile_view');
    const scans = events.filter(e => e.event_type === 'qr_scan');
    const uniqueDays = new Set(events.map(e => dayKey(e.created_at)).filter(Boolean));
    const byDay = {};
    events.forEach(e => {
      const k = dayKey(e.created_at);
      if (!k) return;
      byDay[k] = byDay[k] || { profile_view: 0, qr_scan: 0 };
      byDay[k][e.event_type] = (byDay[k][e.event_type] || 0) + 1;
    });
    const lastEvent = events[0]?.created_at ? new Date(events[0].created_at) : null;
    return {
      views: views.length,
      scans: scans.length,
      total: events.length,
      qrRate: pct(scans.length, events.length),
      activeDays: uniqueDays.size,
      lastEvent,
      byDay: Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b))
    };
  }, [events]);


  async function exportAnalyticsPdf() {
    if (!reportRef.current || exportingPdf) return;
    try {
      setExportingPdf(true);
      await document.fonts?.ready;
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;
      const reportName = (profile?.nome || profile?.cognome)
        ? `${profile?.nome || ''} ${profile?.cognome || ''}`.trim()
        : (profile?.public_slug || 'Profilo');
      await html2pdf()
        .set({
          margin: [12, 12, 14, 12],
          filename: `QR-Curriculum-Analytics-${rangeDays}-giorni.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            windowWidth: reportRef.current.scrollWidth,
            windowHeight: reportRef.current.scrollHeight,
            scrollX: 0,
            scrollY: 0
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
          pagebreak: { mode: ['css', 'legacy'], avoid: ['.pdfKeepTogether', 'tr', 'h2', 'h3'] }
        })
        .from(reportRef.current)
        .save();
    } catch (e) {
      setError(lang === 'en'
        ? `Could not create the PDF report: ${e?.message || 'unknown error'}`
        : `Impossibile generare il report PDF: ${e?.message || 'errore sconosciuto'}`);
    } finally {
      setExportingPdf(false);
    }
  }

  if (loading) return <p className="pageWrap">{t.loading}</p>;

  return (
    <>
      <AppTopbar email={session?.user?.email} />
      <section className="heroPanel analyticsHeroPanel">
        <div className="cleanHero">
          <div className="eyebrow">Analytics</div>
          <h1>{lang === 'en' ? 'Profile statistics' : 'Statistiche profilo'}</h1>
          <p>
            Controlla quante persone aprono il tuo CV pubblico, quante arrivano da QR code e se il profilo sta generando interesse reale.
          </p>
        </div>
        <div className="cvHeroCard">
          <span>Come leggere i dati</span>
          <strong>Visite + QR + trend = efficacia del profilo</strong>
          <p>Le statistiche si popolano quando qualcuno apre il link pubblico /qrcv oppure scansiona il QR.</p>
        </div>
      </section>

      <main className="pageWrap analyticsPage">
        {error && <p className="error analyticsErrorBox">{error}</p>}
      {!serviceRoleConfigured && (
        <p className="analyticsErrorBox">
          {lang === 'en'
            ? 'Server not fully configured: add the SUPABASE_SERVICE_ROLE_KEY environment variable in your hosting provider (Vercel) to enable analytics tracking and reading. Find it on Supabase → Settings → API → "service_role".'
            : 'Server non configurato del tutto: aggiungi la variabile d\'ambiente SUPABASE_SERVICE_ROLE_KEY sul tuo hosting (Vercel) per abilitare davvero tracciamento e lettura degli analytics. La trovi su Supabase → Settings → API → "service_role".'}
        </p>
      )}

        <section className="smartSection analyticsControlPanel">
          <div>
            <h2>Profilo analizzato</h2>
            <p className="muted">
              {profile?.public_slug ? `/qrcv/${profile.public_slug}` : 'Profilo pubblico non ancora configurato'}
              {profile?.job_title ? ` · ${profile.job_title}` : ''}
            </p>
          </div>
          <div className="analyticsControls">
            {[7, 30, 90].map(days => (
              <button key={days} type="button" className={rangeDays === days ? 'active' : ''} onClick={() => setRangeDays(days)}>
                {days} giorni
              </button>
            ))}
            <button type="button" className="btn" onClick={load}>Aggiorna</button>
            <button type="button" className="btn analyticsExportButton" onClick={exportAnalyticsPdf} disabled={exportingPdf}>
              {exportingPdf ? (lang === 'en' ? 'Preparing PDF…' : 'Preparazione PDF…') : (lang === 'en' ? 'Export PDF report' : 'Esporta report PDF')}
            </button>
          </div>
        </section>

        <section className="analyticsGrid analyticsKpiGrid">
          <article className="metricCard analyticsMetricCard">
            <span>Visualizzazioni profilo</span>
            <strong>{stats.views}</strong>
            <p>Indica quante volte il CV pubblico è stato aperto. Serve a capire se il link sta attirando traffico.</p>
          </article>
          <article className="metricCard analyticsMetricCard">
            <span>Scansioni QR</span>
            <strong>{stats.scans}</strong>
            <p>Conta gli accessi arrivati dal QR code. Serve a misurare l'efficacia di biglietti, PDF, badge o portfolio fisici.</p>
          </article>
          <article className="metricCard analyticsMetricCard">
            <span>Eventi totali</span>
            <strong>{stats.total}</strong>
            <p>Somma visualizzazioni e scansioni. Serve come indicatore generale dell'attività del profilo.</p>
          </article>
          <article className="metricCard analyticsMetricCard">
            <span>Incidenza QR</span>
            <strong>{stats.qrRate}%</strong>
            <p>Mostra quanto pesano le scansioni QR sul totale. Serve a capire se il QR viene davvero usato.</p>
          </article>
          <article className="metricCard analyticsMetricCard">
            <span>Giorni attivi</span>
            <strong>{stats.activeDays}</strong>
            <p>Conta in quanti giorni diversi ci sono stati eventi. Serve a distinguere picchi isolati da interesse costante.</p>
          </article>
          <article className="metricCard analyticsMetricCard">
            <span>Ultimo evento</span>
            <strong>{stats.lastEvent ? stats.lastEvent.toLocaleDateString(lang === 'en' ? 'en-US' : 'it-IT') : '-'}</strong>
            <p>Indica quando è avvenuta l'ultima interazione. Serve a capire se il profilo è ancora vivo.</p>
          </article>
        </section>

        {!hasPremium && (
          <section className="paywallBox analyticsPaywall">
            <h2>{t.premiumExpired}</h2>
            <p>Gli analytics base restano visibili. Puoi usare il Premium per sbloccare analisi più dettagliate in futuro.</p>
            <button className="btn primary">{t.upgrade}</button>
          </section>
        )}

        <section className="smartSection analyticsTrendSection">
          <div className="smartSectionHeader">
            <div>
              <h2>{t.dailyTrend}</h2>
              <p>Mostra come si distribuiscono visite e scansioni nel periodo selezionato.</p>
            </div>
          </div>
          <div className="analyticsLegend"><span><i /> Visite</span><span><i className="qr" /> QR</span></div>
          <div className="barList analyticsBarList">
            {stats.byDay.length ? stats.byDay.map(([day, v]) => {
              const max = Math.max(1, stats.views, stats.scans);
              return (
                <div className="barRow analyticsBarRow" key={day}>
                  <span>{day}</span>
                  <div><i style={{ width: `${Math.max(4, (v.profile_view / max) * 100)}%` }} /><b>{v.profile_view}</b></div>
                  <div><i className="qrBar" style={{ width: `${Math.max(4, (v.qr_scan / max) * 100)}%` }} /><b>{v.qr_scan}</b></div>
                </div>
              );
            }) : <p>{t.noEvents}</p>}
          </div>
        </section>

        <section className="smartSection analyticsEventsSection">
          <h2>{t.lastEvents}</h2>
          <p className="muted">Ultime interazioni registrate dal profilo pubblico.</p>
          <div className="analyticsEventList">
            {events.slice(0, 30).length ? events.slice(0, 30).map(e => (
              <article key={e.id}>
                <strong>{e.event_type === 'qr_scan' ? 'Scansione QR' : 'Visualizzazione profilo'}</strong>
                <span>{new Date(e.created_at).toLocaleString(lang === 'en' ? 'en-US' : 'it-IT')}</span>
                <small>{e.public_slug || profile?.public_slug || '-'}</small>
              </article>
            )) : <p>{t.noEvents}</p>}
          </div>
        </section>
      </main>

      {/* Documento dedicato all'esportazione: layout chiaro e tipografico, separato dalla dashboard cosmic. */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-20000px',
          top: 0,
          width: '190mm',
          background: '#ffffff',
          color: '#182033',
          zIndex: -1,
          pointerEvents: 'none'
        }}
      >
        <article ref={reportRef} style={{
          width: '190mm',
          boxSizing: 'border-box',
          padding: '0',
          background: '#ffffff',
          color: '#182033',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '10pt',
          lineHeight: 1.45
        }}>
          <header style={{
            padding: '0 0 7mm',
            marginBottom: '7mm',
            borderBottom: '2px solid #6255e7'
          }}>
            <div style={{ fontSize: '9pt', fontWeight: 800, letterSpacing: '2px', color: '#6255e7', textTransform: 'uppercase' }}>
              QR CURRICULUM · ANALYTICS
            </div>
            <h1 style={{ fontSize: '25pt', lineHeight: 1.12, margin: '4mm 0 2mm', color: '#11182d' }}>
              Report statistiche del profilo
            </h1>
            <p style={{ margin: 0, color: '#5e6880', fontSize: '10pt' }}>
              Analisi degli accessi al CV pubblico e delle scansioni QR
            </p>
          </header>

          <section className="pdfKeepTogether" style={{ marginBottom: '7mm' }}>
            <h2 style={{ margin: '0 0 3mm', color: '#20284a', fontSize: '13pt' }}>Profilo e periodo</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt' }}>
              <tbody>
                <tr>
                  <td style={{ width: '32%', padding: '2.5mm 3mm', background: '#f2f3fb', border: '1px solid #e1e4ef', fontWeight: 700 }}>Profilo</td>
                  <td style={{ padding: '2.5mm 3mm', border: '1px solid #e1e4ef' }}>{profile?.nome || profile?.cognome ? `${profile?.nome || ''} ${profile?.cognome || ''}`.trim() : 'Profilo QR Curriculum'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '2.5mm 3mm', background: '#f2f3fb', border: '1px solid #e1e4ef', fontWeight: 700 }}>Link pubblico</td>
                  <td style={{ padding: '2.5mm 3mm', border: '1px solid #e1e4ef', overflowWrap: 'anywhere' }}>{profile?.public_slug ? `/qrcv/${profile.public_slug}` : 'Non configurato'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '2.5mm 3mm', background: '#f2f3fb', border: '1px solid #e1e4ef', fontWeight: 700 }}>Ruolo professionale</td>
                  <td style={{ padding: '2.5mm 3mm', border: '1px solid #e1e4ef' }}>{profile?.job_title || 'Non indicato'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '2.5mm 3mm', background: '#f2f3fb', border: '1px solid #e1e4ef', fontWeight: 700 }}>Periodo analizzato</td>
                  <td style={{ padding: '2.5mm 3mm', border: '1px solid #e1e4ef' }}>Ultimi {rangeDays} giorni · Generato il {new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'it-IT')}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="pdfKeepTogether" style={{ marginBottom: '7mm' }}>
            <h2 style={{ margin: '0 0 3mm', color: '#20284a', fontSize: '13pt' }}>Indicatori principali</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt' }}>
              <thead>
                <tr style={{ background: '#20284a', color: '#ffffff' }}>
                  <th style={{ textAlign: 'left', padding: '3mm', border: '1px solid #20284a' }}>Indicatore</th>
                  <th style={{ textAlign: 'right', padding: '3mm', border: '1px solid #20284a', width: '25%' }}>Valore</th>
                  <th style={{ textAlign: 'left', padding: '3mm', border: '1px solid #20284a' }}>Significato</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Visualizzazioni profilo', stats.views, 'Aperture registrate del CV pubblico.'],
                  ['Scansioni QR', stats.scans, 'Accessi registrati tramite QR code.'],
                  ['Eventi totali', stats.total, 'Totale delle visualizzazioni e delle scansioni registrate.'],
                  ['Incidenza QR', `${stats.qrRate}%`, 'Quota delle scansioni QR sul totale degli eventi.'],
                  ['Giorni attivi', stats.activeDays, 'Numero di giorni con almeno un evento registrato.'],
                  ['Ultimo evento', stats.lastEvent ? stats.lastEvent.toLocaleString(lang === 'en' ? 'en-US' : 'it-IT') : 'Nessun evento', 'Data e ora dell’interazione più recente.']
                ].map(([label, value, description]) => (
                  <tr key={label} className="pdfKeepTogether">
                    <td style={{ padding: '2.7mm 3mm', border: '1px solid #e1e4ef', fontWeight: 700 }}>{label}</td>
                    <td style={{ padding: '2.7mm 3mm', border: '1px solid #e1e4ef', textAlign: 'right', fontWeight: 800, color: '#5145cf' }}>{value}</td>
                    <td style={{ padding: '2.7mm 3mm', border: '1px solid #e1e4ef', color: '#59647a' }}>{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section style={{ marginBottom: '7mm' }}>
            <h2 style={{ margin: '0 0 2mm', color: '#20284a', fontSize: '13pt' }}>Andamento giornaliero</h2>
            <p style={{ margin: '0 0 3mm', color: '#68728a', fontSize: '9pt' }}>
              Il dettaglio mostra il numero di visite al profilo e scansioni QR per ogni giorno in cui sono stati registrati eventi.
            </p>
            {stats.byDay.length ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
                <thead>
                  <tr style={{ background: '#20284a', color: '#ffffff' }}>
                    <th style={{ textAlign: 'left', padding: '2.5mm 3mm', border: '1px solid #20284a' }}>Data</th>
                    <th style={{ textAlign: 'right', padding: '2.5mm 3mm', border: '1px solid #20284a' }}>Visite profilo</th>
                    <th style={{ textAlign: 'right', padding: '2.5mm 3mm', border: '1px solid #20284a' }}>Scansioni QR</th>
                    <th style={{ textAlign: 'right', padding: '2.5mm 3mm', border: '1px solid #20284a' }}>Totale</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.byDay.map(([day, values], index) => (
                    <tr key={day} className="pdfKeepTogether" style={{ background: index % 2 ? '#f7f8fc' : '#ffffff' }}>
                      <td style={{ padding: '2mm 3mm', border: '1px solid #e1e4ef' }}>{new Date(`${day}T12:00:00`).toLocaleDateString(lang === 'en' ? 'en-US' : 'it-IT')}</td>
                      <td style={{ padding: '2mm 3mm', border: '1px solid #e1e4ef', textAlign: 'right' }}>{values.profile_view}</td>
                      <td style={{ padding: '2mm 3mm', border: '1px solid #e1e4ef', textAlign: 'right' }}>{values.qr_scan}</td>
                      <td style={{ padding: '2mm 3mm', border: '1px solid #e1e4ef', textAlign: 'right', fontWeight: 700 }}>{values.profile_view + values.qr_scan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ margin: 0, padding: '5mm', border: '1px solid #e1e4ef', borderRadius: '2mm', color: '#68728a' }}>
                Nessun evento registrato nel periodo selezionato.
              </p>
            )}
          </section>

          <section>
            <h2 style={{ margin: '0 0 2mm', color: '#20284a', fontSize: '13pt' }}>Interazioni recenti</h2>
            <p style={{ margin: '0 0 3mm', color: '#68728a', fontSize: '9pt' }}>Ultime 100 interazioni disponibili per il periodo selezionato.</p>
            {events.length ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt' }}>
                <thead>
                  <tr style={{ background: '#20284a', color: '#ffffff' }}>
                    <th style={{ textAlign: 'left', padding: '2.5mm 3mm', border: '1px solid #20284a' }}>Tipo evento</th>
                    <th style={{ textAlign: 'left', padding: '2.5mm 3mm', border: '1px solid #20284a' }}>Data e ora</th>
                    <th style={{ textAlign: 'left', padding: '2.5mm 3mm', border: '1px solid #20284a' }}>Profilo</th>
                  </tr>
                </thead>
                <tbody>
                  {events.slice(0, 100).map((event, index) => (
                    <tr key={event.id || `${event.created_at}-${index}`} className="pdfKeepTogether" style={{ background: index % 2 ? '#f7f8fc' : '#ffffff' }}>
                      <td style={{ padding: '2mm 3mm', border: '1px solid #e1e4ef' }}>{event.event_type === 'qr_scan' ? 'Scansione QR' : 'Visualizzazione profilo'}</td>
                      <td style={{ padding: '2mm 3mm', border: '1px solid #e1e4ef' }}>{new Date(event.created_at).toLocaleString(lang === 'en' ? 'en-US' : 'it-IT')}</td>
                      <td style={{ padding: '2mm 3mm', border: '1px solid #e1e4ef', overflowWrap: 'anywhere' }}>{event.public_slug || profile?.public_slug || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ margin: 0, padding: '5mm', border: '1px solid #e1e4ef', borderRadius: '2mm', color: '#68728a' }}>
                Nessuna interazione registrata nel periodo selezionato.
              </p>
            )}
          </section>

          <footer style={{ marginTop: '8mm', paddingTop: '3mm', borderTop: '1px solid #dfe3ef', color: '#7b8499', fontSize: '8pt' }}>
            QR Curriculum · Report generato automaticamente sulla base degli eventi registrati nel periodo selezionato.
          </footer>
        </article>
      </div>
    </>
  );
}
