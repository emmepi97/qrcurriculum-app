'use client';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { useLang } from '@/components/LanguageProvider';

const STATUS_LABELS = {
  new: { it: 'Ricevuto', en: 'Received', dot: 'dotWaiting' },
  planned: { it: 'Pianificato', en: 'Planned', dot: 'dotPending' },
  in_progress: { it: 'In lavorazione', en: 'In progress', dot: 'dotPending' },
  done: { it: 'Realizzato', en: 'Done', dot: 'dotPublished' },
  rejected: { it: 'Non previsto', en: 'Not planned', dot: 'dotOther' }
};

export default function FeatureSuggestions({ userId }) {
  const { lang } = useLang();
  const isEn = lang === 'en';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { if (userId) load(); }, [userId]);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('feature_suggestions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
    setItems(data || []);
    setLoading(false);
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setBusy(true);
    setMsg('');
    try {
      const { error } = await supabase.from('feature_suggestions').insert({ user_id: userId, title: form.title.trim(), description: form.description.trim() });
      if (error) throw error;
      setForm({ title: '', description: '' });
      setShowForm(false);
      setMsg(isEn ? 'Thanks! Your suggestion was sent.' : 'Grazie! Il tuo suggerimento è stato inviato.');
      await load();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="smartSection featureSuggestions">
      <div className="smartSectionHeader">
        <div>
          <h2>{isEn ? 'Suggestions for the platform' : 'Suggerimenti per la piattaforma'}</h2>
          <p>{isEn
            ? 'Missing a feature or have an idea to improve QR Curriculum? Tell us — we read every suggestion.'
            : 'Manca una funzione o hai un\'idea per migliorare QR Curriculum? Dicci pure — leggiamo ogni suggerimento.'}</p>
        </div>
        <button type="button" className="btn primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? (isEn ? 'Cancel' : 'Annulla') : `+ ${isEn ? 'New suggestion' : 'Nuovo suggerimento'}`}
        </button>
      </div>

      {showForm && (
        <form className="quickForm" onSubmit={submit}>
          <label>{isEn ? 'Title' : 'Titolo'}<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></label>
          <label>{isEn ? 'Description (optional)' : 'Descrizione (facoltativa)'}<textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
          <button className="btn primary" disabled={busy}>{busy ? (isEn ? 'Sending...' : 'Invio...') : (isEn ? 'Send suggestion' : 'Invia suggerimento')}</button>
        </form>
      )}
      {msg && <p className="formFeedback">{msg}</p>}

      {loading ? <p className="hint">{isEn ? 'Loading...' : 'Caricamento...'}</p> : (
        items.length === 0 && !showForm ? (
          <p className="muted reviewsEmptyState">
            {isEn ? 'No suggestions sent yet.' : 'Nessun suggerimento inviato ancora.'}
          </p>
        ) : (
          <div className="reviewList">
            {items.map(it => {
              const st = STATUS_LABELS[it.status] || STATUS_LABELS.new;
              return (
                <article className="reviewRow reviewRowFull" key={it.id}>
                  <div>
                    <b><span className={`reviewStatusDot ${st.dot}`} />{it.title}</b>
                    {it.description && <p>{it.description}</p>}
                    {it.admin_notes && <p className="muted"><i>{isEn ? 'Team note' : 'Nota del team'}:</i> {it.admin_notes}</p>}
                  </div>
                  <span className={`statusBadge ${it.status === 'done' ? 'statusApproved' : it.status === 'rejected' ? 'statusRejected' : it.status === 'new' ? 'statusOpen' : 'statusPending'}`}>
                    {st[lang] || st.it}
                  </span>
                </article>
              );
            })}
          </div>
        )
      )}
    </section>
  );
}
