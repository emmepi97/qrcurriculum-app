'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import { slugify } from '@/lib/helpers';
import { useLang } from '@/components/LanguageProvider';
import AppTopbar from '@/components/AppTopbar';

const SECTION_OPTIONS = [
  { key: 'personal_info', label: 'Dati personali', locked: true },
  { key: 'summary', label: 'Profilo / About' },
  { key: 'work_experiences', label: 'Esperienze' },
  { key: 'educations', label: 'Formazione' },
  { key: 'skills', label: 'Competenze' },
  { key: 'languages', label: 'Lingue' },
  { key: 'projects', label: 'Progetti' },
  { key: 'case_studies', label: 'Case Study' },
  { key: 'awards', label: 'Premi' },
  { key: 'reviews', label: 'Recensioni' },
  { key: 'availability', label: 'Disponibilità professionale' }
];

const DEFAULT_SECTIONS = SECTION_OPTIONS.reduce((acc, item) => ({ ...acc, [item.key]: true }), {});

const TEMPLATES = [
  {
    id: 'operations',
    title: 'CV Operations / Produzione',
    desc: 'Versione orientata a ruoli operativi, produzione, pianificazione e miglioramento processi.',
    sections: { ...DEFAULT_SECTIONS, reviews: false }
  },
  {
    id: 'manager',
    title: 'CV Manageriale',
    desc: 'Versione più adatta a ruoli di coordinamento, leadership, responsabilità e crescita.',
    sections: { ...DEFAULT_SECTIONS, awards: true, reviews: true }
  },
  {
    id: 'data',
    title: 'CV Data / Digital',
    desc: 'Versione centrata su competenze digitali, progetti, analytics e strumenti tecnici.',
    sections: { ...DEFAULT_SECTIONS, awards: false, availability: false }
  },
  {
    id: 'essential',
    title: 'CV Essenziale 1 pagina',
    desc: 'Versione asciutta per candidature rapide: solo contenuti ad alto impatto.',
    sections: { personal_info: true, summary: true, work_experiences: true, educations: true, skills: true, languages: true, projects: false, case_studies: false, awards: false, reviews: false, availability: false }
  }
];

function emptyForm(lang = 'it') {
  return {
    title: '',
    slug: '',
    lang,
    is_public: true,
    is_premium: true,
    enabled_sections: DEFAULT_SECTIONS
  };
}

function normalizeSections(value) {
  if (!value || typeof value !== 'object') return DEFAULT_SECTIONS;
  return { ...DEFAULT_SECTIONS, ...value, personal_info: true };
}

export default function CvVersionsPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [session, setSession] = useState(null);
  const [personal, setPersonal] = useState(null);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm(lang));
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/login?next=/cv-versions');
        return;
      }
      setSession(data.session);
    });
  }, [router]);

  useEffect(() => {
    setForm(prev => ({ ...prev, lang: prev.lang || lang }));
  }, [lang]);

  useEffect(() => {
    if (session?.user?.id) load();
  }, [session?.user?.id]);

  async function load() {
    try {
      setLoading(true);
      setMsg('');
      const uid = session.user.id;
      const [{ data: versionRows, error: versionError }, { data: profile }] = await Promise.all([
        supabase.from('cv_versions').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
        supabase.from('personal_info').select('public_slug,nome,cognome,job_title').eq('user_id', uid).maybeSingle()
      ]);
      if (versionError) throw versionError;
      setRows(versionRows || []);
      setPersonal(profile || null);
    } catch (error) {
      setMsg(error.message || 'Errore durante il caricamento delle versioni CV.');
    } finally {
      setLoading(false);
    }
  }

  function applyTemplate(template) {
    setEditingId(null);
    setForm({
      ...emptyForm(lang),
      title: template.title,
      slug: `${slugify(template.title)}-${Math.random().toString(16).slice(2, 6)}`,
      enabled_sections: normalizeSections(template.sections)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function edit(row) {
    setEditingId(row.id);
    setForm({
      title: row.title || '',
      slug: row.slug || '',
      lang: row.lang || lang,
      is_public: row.is_public !== false,
      is_premium: row.is_premium !== false,
      enabled_sections: normalizeSections(row.enabled_sections)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm(lang));
    setMsg('');
  }

  function setSection(key, checked) {
    if (key === 'personal_info') return;
    setForm(prev => ({
      ...prev,
      enabled_sections: { ...normalizeSections(prev.enabled_sections), [key]: checked, personal_info: true }
    }));
  }

  async function save(e) {
    e.preventDefault();
    const cleanTitle = form.title.trim();
    if (!cleanTitle) {
      setMsg('Inserisci un nome per la versione CV.');
      return;
    }
    try {
      setBusy(true);
      setMsg('');
      const finalSlug = slugify(form.slug || cleanTitle) || `cv-${Math.random().toString(16).slice(2, 8)}`;
      const payload = {
        user_id: session.user.id,
        title: cleanTitle,
        slug: editingId ? finalSlug : `${finalSlug}-${Math.random().toString(16).slice(2, 6)}`,
        lang: form.lang,
        is_public: Boolean(form.is_public),
        is_premium: Boolean(form.is_premium),
        enabled_sections: normalizeSections(form.enabled_sections)
      };
      const result = editingId
        ? await supabase.from('cv_versions').update(payload).eq('id', editingId).eq('user_id', session.user.id)
        : await supabase.from('cv_versions').insert(payload);
      if (result.error) throw result.error;
      const successMessage = editingId ? 'Versione CV aggiornata.' : 'Versione CV creata.';
      resetForm();
      setMsg(successMessage);
      await load();
    } catch (error) {
      setMsg(error.message || 'Errore durante il salvataggio.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(row) {
    if (!confirm(`Eliminare la versione "${row.title}"?`)) return;
    try {
      setBusy(true);
      const { error } = await supabase.from('cv_versions').delete().eq('id', row.id).eq('user_id', session.user.id);
      if (error) throw error;
      setMsg('Versione eliminata.');
      await load();
    } catch (error) {
      setMsg(error.message || 'Errore durante eliminazione.');
    } finally {
      setBusy(false);
    }
  }

  const filteredRows = useMemo(() => {
    const q = filter.toLowerCase();
    return rows.filter(row => [row.title, row.slug, row.lang].join(' ').toLowerCase().includes(q));
  }, [rows, filter]);

  const enabledCount = Object.values(normalizeSections(form.enabled_sections)).filter(Boolean).length;
  const publicBaseUrl = personal?.public_slug ? `/qrcv/${personal.public_slug}` : '/qrcv/tuo-profilo';

  if (loading) return <p className="pageWrap">{t.loading}</p>;

  return (
    <>
      <AppTopbar email={session?.user?.email} />
      <section className="heroPanel cvVersionsHero">
        <div className="cleanHero">
          <div className="eyebrow">Premium · CV Multipli</div>
          <h1>{t.cvVersions}</h1>
          <p>
            Crea varianti del tuo CV per candidature diverse. Non devi avere un solo CV generico: puoi preparare una versione per produzione, una per ruoli manageriali, una per data/digital e una versione essenziale da una pagina.
          </p>
        </div>
        <div className="cvHeroCard">
          <span>Obiettivo</span>
          <strong>CV mirato = candidatura più chiara</strong>
          <p>Ogni versione salva lingua, visibilità e sezioni da mostrare. Così prepari CV diversi senza riscrivere tutto da zero.</p>
        </div>
      </section>

      <main className="pageWrap cvVersionsPage">
        <section className="cvExplanationGrid">
          <article className="smartSection cvInfoCard">
            <span className="cvInfoNumber">01</span>
            <h2>A cosa serve?</h2>
            <p>Serve a non mandare sempre lo stesso CV. Per ogni candidatura puoi decidere quali sezioni far pesare di più e quali togliere.</p>
          </article>
          <article className="smartSection cvInfoCard">
            <span className="cvInfoNumber">02</span>
            <h2>Quando usarlo?</h2>
            <p>Quando ti candidi a ruoli diversi: produzione, operations, data, digital, management, stage, consulenza o freelance.</p>
          </article>
          <article className="smartSection cvInfoCard">
            <span className="cvInfoNumber">03</span>
            <h2>Cosa salva?</h2>
            <p>Nome versione, slug, lingua, stato pubblico/premium e checklist sezioni. È la base per generare CV mirati.</p>
          </article>
        </section>

        <section className="cvVersionsLayout">
          <form className="smartSection cvVersionBuilder" onSubmit={save}>
            <div className="smartSectionHeader">
              <div>
                <h2>{editingId ? 'Modifica versione CV' : 'Crea una versione CV'}</h2>
                <p>Scegli nome, lingua e sezioni da includere. Più sei specifico, più la candidatura risulta leggibile.</p>
              </div>
              <span className="lightPill">{enabledCount} sezioni attive</span>
            </div>

            <div className="cvVersionFormGrid">
              <label>
                Nome versione
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Es. CV Operations, CV Data Analyst, CV Manager"
                  required
                />
              </label>
              <label>
                Slug interno
                <input
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value })}
                  placeholder="Se vuoto viene creato automaticamente"
                />
              </label>
              <label>
                Lingua
                <select value={form.lang} onChange={e => setForm({ ...form, lang: e.target.value })}>
                  <option value="it">Italiano</option>
                  <option value="en">English</option>
                </select>
              </label>
              <label className="check cvCheckInline">
                <input type="checkbox" checked={form.is_public} onChange={e => setForm({ ...form, is_public: e.target.checked })} />
                Versione pubblicabile
              </label>
              <label className="check cvCheckInline">
                <input type="checkbox" checked={form.is_premium} onChange={e => setForm({ ...form, is_premium: e.target.checked })} />
                Funzione Premium
              </label>
            </div>

            <h3>Sezioni da includere</h3>
            <div className="cvSectionChecklist">
              {SECTION_OPTIONS.map(item => (
                <label key={item.key} className={`cvSectionToggle ${form.enabled_sections?.[item.key] ? 'active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={Boolean(normalizeSections(form.enabled_sections)[item.key])}
                    disabled={item.locked}
                    onChange={e => setSection(item.key, e.target.checked)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>

            <div className="quickFormActions splitActions">
              <button type="button" className="btn" onClick={resetForm}>Nuova pulita</button>
              <button className="btn primary" disabled={busy}>{busy ? 'Salvataggio...' : editingId ? 'Aggiorna versione' : 'Crea versione'}</button>
            </div>
            {msg && <p className={msg.toLowerCase().includes('errore') ? 'error' : 'success'}>{msg}</p>}
          </form>

          <aside className="smartSection cvTemplatePanel">
            <h2>Template rapidi</h2>
            <p className="muted">Se vuoi partire veloce, clicca un template e poi personalizzalo.</p>
            <div className="cvTemplateList">
              {TEMPLATES.map(template => (
                <button type="button" key={template.id} onClick={() => applyTemplate(template)}>
                  <strong>{template.title}</strong>
                  <span>{template.desc}</span>
                </button>
              ))}
            </div>
            <div className="warningBox cvNextStepBox">
              <strong>Nota MVP</strong>
              <p>Questa pagina ora rende chiaro a cosa servono le versioni e salva la configurazione in database. Lo step successivo è collegare ogni versione al rendering pubblico del CV.</p>
            </div>
          </aside>
        </section>

        <section className="smartSection cvVersionsListSection">
          <div className="smartSectionHeader">
            <div>
              <h2>Le tue versioni</h2>
              <p>Gestisci le varianti già create e controlla rapidamente lingua, sezioni attive e stato.</p>
            </div>
            <input className="cvSearch" value={filter} onChange={e => setFilter(e.target.value)} placeholder="Cerca versione..." />
          </div>

          {filteredRows.length === 0 ? (
            <div className="emptyStateBox">
              <h3>Nessuna versione trovata</h3>
              <p>Crea la prima versione partendo da zero o usando un template rapido.</p>
            </div>
          ) : (
            <div className="cvVersionCards">
              {filteredRows.map(row => {
                const sections = normalizeSections(row.enabled_sections);
                const activeLabels = SECTION_OPTIONS.filter(item => sections[item.key]).map(item => item.label);
                return (
                  <article className="cvVersionCard" key={row.id}>
                    <div className="cvVersionCardTop">
                      <div>
                        <h3>{row.title}</h3>
                        <p>{row.slug} · {row.lang?.toUpperCase()}</p>
                      </div>
                      <div className="cvVersionBadges">
                        <span className={row.is_public ? 'lightPill' : 'hiddenPill'}>{row.is_public ? 'Pubblica' : 'Privata'}</span>
                        {row.is_premium && <span className="lightPill">Premium</span>}
                      </div>
                    </div>
                    <div className="tagCloud cvVersionTags">
                      {activeLabels.slice(0, 7).map(label => <span className="tagPill" key={label}>{label}</span>)}
                      {activeLabels.length > 7 && <span className="tagPill">+{activeLabels.length - 7}</span>}
                    </div>
                    <div className="cvVersionActions">
                      <button type="button" className="btn" onClick={() => edit(row)}>Modifica</button>
                      <button type="button" className="btn" onClick={() => navigator.clipboard?.writeText(`${window.location.origin}${publicBaseUrl}`)}>Copia link profilo base</button>
                      <Link className="btn" href={publicBaseUrl} target="_blank">Apri CV base</Link>
                      <button type="button" className="btn dangerBtn" onClick={() => remove(row)}>Elimina</button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
