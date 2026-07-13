'use client';
import { useEffect, useMemo, useState } from 'react';
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
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState('');
  const [rangeDays, setRangeDays] = useState(30);

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

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();
      setSubscription(sub || null);

      const since = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000).toISOString();
      let query = supabase
        .from('analytics_events')
        .select('id,event_type,profile_user_id,public_slug,path,referrer,created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (profileData?.public_slug) {
        query = query.or(`profile_user_id.eq.${uid},public_slug.eq.${profileData.public_slug}`);
      } else {
        query = query.eq('profile_user_id', uid);
      }

      const { data, error: eventsError } = await query;
      if (eventsError) throw eventsError;
      setEvents(data || []);
    } catch (e) {
      setError(`${e.message}. Se non vedi dati, verifica di aver eseguito la migration e che il profilo pubblico venga visitato tramite /qrcv/slug.`);
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
    </>
  );
}
