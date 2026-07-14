'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import supabase from '@/lib/supabaseClient';
import { useLang } from '@/components/LanguageProvider';
import AppTopbar from '@/components/AppTopbar';

const AVAILABILITY_LABELS = [
  { key: 'open_to_work', it: 'Nuove opportunità', en: 'Open to work' },
  { key: 'consulting', it: 'Consulenze', en: 'Consulting' },
  { key: 'freelance', it: 'Freelance', en: 'Freelance' },
  { key: 'networking', it: 'Networking', en: 'Networking' },
  { key: 'teaching', it: 'Formazione', en: 'Training' },
  { key: 'collaborations', it: 'Collaborazioni', en: 'Collaborations' }
];

const QUICK_FILTERS = [
  { key: 'all', it: 'Tutti', en: 'All' },
  { key: 'open_to_work', it: 'Cerca lavoro', en: 'Open to work' },
  { key: 'consulting', it: 'Consulenti', en: 'Consultants' },
  { key: 'freelance', it: 'Freelance', en: 'Freelance' },
  { key: 'collaborations', it: 'Collaborazioni', en: 'Collaborations' }
];

function labelsFor(row, lang) {
  return AVAILABILITY_LABELS.filter(item => row.availability?.[item.key]).map(item => lang === 'en' ? item.en : item.it);
}

function initials(row) {
  return [row.nome, row.cognome].filter(Boolean).map(x => String(x).trim()[0]).join('').slice(0, 2).toUpperCase() || 'CV';
}

export default function DirectoryPage() {
  const { lang } = useLang();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError('');
      const { data: av, error: avError } = await supabase
        .from('professional_availability')
        .select('user_id,open_to_work,consulting,freelance,networking,teaching,collaborations,contact_message')
        .eq('show_in_directory', true);
      if (avError) throw avError;

      const ids = (av || []).map(x => x.user_id);
      if (!ids.length) {
        setRows([]);
        return;
      }

      const { data: profiles, error: profileError } = await supabase
        .from('personal_info')
        .select('user_id,nome,cognome,job_title,citta_residenza,nazione,public_slug')
        .in('user_id', ids)
        .eq('is_public', true);
      if (profileError) throw profileError;

      const availabilityByUser = new Map((av || []).map(x => [x.user_id, x]));
      setRows((profiles || []).map(profile => ({
        ...profile,
        availability: availabilityByUser.get(profile.user_id)
      })).sort((a, b) => [a.cognome, a.nome].join(' ').localeCompare([b.cognome, b.nome].join(' '), 'it')));
    } catch (err) {
      setError(err.message || 'Errore durante il caricamento della directory.');
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const base = { total: rows.length, open_to_work: 0, consulting: 0, freelance: 0, collaborations: 0 };
    rows.forEach(row => {
      Object.keys(base).forEach(key => {
        if (key !== 'total' && row.availability?.[key]) base[key] += 1;
      });
    });
    return base;
  }, [rows]);

  const filtered = useMemo(() => {
    const query = q.toLowerCase().trim();
    return rows.filter(row => {
      const haystack = [
        row.nome,
        row.cognome,
        row.job_title,
        row.citta_residenza,
        row.nazione,
        row.availability?.contact_message,
        labelsFor(row, lang).join(' ')
      ].join(' ').toLowerCase();
      const queryMatch = !query || haystack.includes(query);
      const filterMatch = activeFilter === 'all' || Boolean(row.availability?.[activeFilter]);
      return queryMatch && filterMatch;
    });
  }, [rows, q, activeFilter, lang]);

  return (
    <>
      <AppTopbar />
      <section className="heroPanel directoryHeroPanel">
        <div className="cleanHero">
          <div className="eyebrow">Directory professionisti</div>
          <h1>{lang === 'en' ? 'Find visible professional profiles' : 'Trova professionisti disponibili'}</h1>
          <p>
            {lang === 'en'
              ? 'A public showcase of users who choose to be visible for work opportunities, consulting, freelance projects, training, networking and collaborations.'
              : 'Una vetrina pubblica per chi sceglie di rendersi visibile per opportunità di lavoro, consulenze, freelance, formazione, networking e collaborazioni.'}
          </p>
          <div className="directoryHeroActions">
            <a className="btn light" href="#professionisti">Esplora profili</a>
            <Link className="btn dark" href="/monetization">Voglio comparire qui</Link>
          </div>
        </div>
        <div className="directoryHeroCard">
          <span>Perché esiste</span>
          <strong>Trasforma il CV pubblico in una rete professionale</strong>
          <p>Non è una lista casuale: mostra solo chi ha attivato la visibilità e ha scelto quali disponibilità rendere pubbliche.</p>
        </div>
      </section>

      <main className="pageWrap directoryPage">
        <section className="directoryValueGrid">
          <article className="smartSection directoryValueCard">
            <span>01</span>
            <h2>Per aziende e recruiter</h2>
            <p>Cercano persone già disponibili, con profilo pubblico e CV consultabile subito.</p>
          </article>
          <article className="smartSection directoryValueCard">
            <span>02</span>
            <h2>Per professionisti</h2>
            <p>Aumentano visibilità e possibilità di essere contattati senza dover inviare ogni volta il CV.</p>
          </article>
          <article className="smartSection directoryValueCard">
            <span>03</span>
            <h2>Per monetizzare</h2>
            <p>In futuro può diventare una funzione Premium: profili in evidenza, filtri avanzati e accesso aziende.</p>
          </article>
        </section>

        <section className="smartSection directoryControlPanel" id="professionisti">
          <div className="directoryControlTop">
            <div>
              <h2>Professionisti visibili</h2>
              <p>Filtra per disponibilità, ruolo, città, nome o messaggio di contatto.</p>
            </div>
            <button type="button" className="btn" onClick={load}>Aggiorna</button>
          </div>

          <div className="directoryStatsGrid">
            <div><span>Totale</span><strong>{stats.total}</strong></div>
            <div><span>Cerca lavoro</span><strong>{stats.open_to_work}</strong></div>
            <div><span>Consulenze</span><strong>{stats.consulting}</strong></div>
            <div><span>Freelance</span><strong>{stats.freelance}</strong></div>
          </div>

          <div className="directorySearchRow">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cerca ruolo, città, nome, disponibilità..." />
            <div className="directoryFilterPills">
              {QUICK_FILTERS.map(item => (
                <button
                  type="button"
                  key={item.key}
                  className={activeFilter === item.key ? 'active' : ''}
                  onClick={() => setActiveFilter(item.key)}
                >
                  {lang === 'en' ? item.en : item.it}
                </button>
              ))}
            </div>
          </div>

          <p className="hint directoryHint">
            Nota: un profilo compare qui solo se l’utente ha attivato “Mostrami nella directory” nella sezione Monetizzazione / Disponibilità professionale.
          </p>
          {error && <p className="error">{error}</p>}
        </section>

        {loading ? (
          <section className="smartSection emptyStateBox"><h3>Caricamento directory...</h3></section>
        ) : filtered.length === 0 ? (
          <section className="smartSection directoryEmptyState">
            <h2>Nessun profilo trovato</h2>
            <p>Non ci sono profili compatibili con i filtri scelti oppure nessun utente ha ancora attivato la visibilità in directory.</p>
            <div className="directoryHeroActions">
              <button type="button" className="btn" onClick={() => { setQ(''); setActiveFilter('all'); }}>Reset filtri</button>
              <Link className="btn primary" href="/monetization">Attiva la tua visibilità</Link>
            </div>
          </section>
        ) : (
          <section className="directoryCardsGrid">
            {filtered.map(row => {
              const tags = labelsFor(row, lang);
              return (
                <article className="directoryProfileCard" key={row.user_id}>
                  <div className="directoryProfileTop">
                    <div className="directoryAvatar">{initials(row)}</div>
                    <div>
                      <h3>{row.nome} {row.cognome}</h3>
                      <p>{row.job_title || 'Profilo professionale'}</p>
                    </div>
                  </div>
                  <p className="directoryLocation">{[row.citta_residenza, row.nazione].filter(Boolean).join(' · ') || 'Località non indicata'}</p>
                  <div className="tagCloud directoryTags">
                    {tags.length ? tags.map(label => <span className="tagPill" key={label}>{label}</span>) : <span className="tagPill">Disponibile</span>}
                  </div>
                  {row.availability?.contact_message ? (
                    <p className="directoryMessage">“{row.availability.contact_message}”</p>
                  ) : (
                    <p className="directoryMessage muted">Nessun messaggio di contatto inserito.</p>
                  )}
                  <div className="directoryProfileActions">
                    <Link className="btn primary" href={`/qrcv/${row.public_slug}`}>Apri profilo</Link>
                    <button type="button" className="btn" onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/qrcv/${row.public_slug}`)}>Copia link</button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </>
  );
}