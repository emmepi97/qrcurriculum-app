'use client';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { useLang } from '@/components/LanguageProvider';

export default function ReviewsManager({ userId }) {
  const { t, lang } = useLang();
  const [requests, setRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ reviewer_name: '', reviewer_email: '' });
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { if (userId) load(); }, [userId]);

  async function load() {
    setLoading(true);
    const [{ data: reqs }, { data: rev }] = await Promise.all([
      supabase.from('review_requests').select('*').eq('owner_user_id', userId).order('created_at', { ascending: false }).limit(30),
      supabase.from('portfolio_reviews').select('*').eq('owner_user_id', userId).order('created_at', { ascending: false }).limit(50)
    ]);
    setRequests(reqs || []);
    setReviews(rev || []);
    setLoading(false);
  }

  async function createRequest(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await supabase.from('review_requests').insert({
        owner_user_id: userId,
        reviewer_name: form.reviewer_name,
        reviewer_email: form.reviewer_email
      });
      setForm({ reviewer_name: '', reviewer_email: '' });
      setShowForm(false);
      await load();
    } finally {
      setBusy(false);
    }
  }

  function copyLink(req) {
    const url = `${window.location.origin}/reviews/${req.token}`;
    navigator.clipboard?.writeText(url);
    setCopiedId(req.id);
    setTimeout(() => setCopiedId(''), 1800);
  }

  async function setReviewStatus(review, status) {
    await supabase.from('portfolio_reviews').update({ status, updated_at: new Date().toISOString() }).eq('id', review.id);
    setReviews(rows => rows.map(r => r.id === review.id ? { ...r, status } : r));
  }

  async function toggleConsent(review) {
    const next = !review.consent_publication;
    await supabase.from('portfolio_reviews').update({ consent_publication: next, updated_at: new Date().toISOString() }).eq('id', review.id);
    setReviews(rows => rows.map(r => r.id === review.id ? { ...r, consent_publication: next } : r));
  }

  const openRequests = requests.filter(r => r.status === 'open');
  const pending = reviews.filter(r => r.status === 'pending');
  const published = reviews.filter(r => r.status === 'approved' && r.consent_publication);
  const others = reviews.filter(r => r.status !== 'pending' && !(r.status === 'approved' && r.consent_publication));
  const isEn = lang === 'en';

  return (
    <section className="smartSection reviewsManager">
      <div className="smartSectionHeader">
        <div>
          <h2>{t.manageReviews}</h2>
          <p>{isEn
            ? 'Get testimonials from people who worked with you and choose which ones appear on your public portfolio.'
            : 'Raccogli testimonianze da chi ha lavorato con te e scegli quali far comparire nel tuo portfolio pubblico.'}</p>
        </div>
        <button type="button" className="btn primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? (isEn ? 'Cancel' : 'Annulla') : `+ ${t.newReviewRequest}`}
        </button>
      </div>

      <ol className="reviewsSteps">
        <li><b>1.</b> {isEn ? 'Generate a personal link and send it to a colleague, manager or client.' : 'Genera un link personale e invialo a un collega, manager o cliente.'}</li>
        <li><b>2.</b> {isEn ? 'They fill in a short review through that link.' : 'La persona compila una breve recensione tramite quel link.'}</li>
        <li><b>3.</b> {isEn ? 'You approve it here and choose whether to publish it on your portfolio.' : 'Tu la approvi qui e decidi se pubblicarla nel tuo portfolio.'}</li>
      </ol>

      {showForm && (
        <form className="quickForm reviewRequestForm" onSubmit={createRequest}>
          <label>{t.reviewerNameLabel}<input value={form.reviewer_name} onChange={e => setForm({ ...form, reviewer_name: e.target.value })} /></label>
          <label>{t.reviewerEmailLabel}<input type="email" value={form.reviewer_email} onChange={e => setForm({ ...form, reviewer_email: e.target.value })} /></label>
          <button className="btn primary" disabled={busy}>{t.generateLink}</button>
        </form>
      )}

      {loading ? <p className="hint">{t.loading}</p> : (
        <>
          {openRequests.length === 0 && pending.length === 0 && reviews.length === 0 && !showForm && (
            <p className="muted reviewsEmptyState">
              {isEn ? 'No requests yet — click "New request" to get your first testimonial.' : 'Nessuna richiesta ancora — clicca su "Nuova richiesta" per ricevere la tua prima testimonianza.'}
            </p>
          )}

          {openRequests.length > 0 && (
            <div className="reviewGroup">
              <h4><span className="reviewStatusDot dotWaiting" />{isEn ? 'Waiting for a reply' : 'In attesa di risposta'} ({openRequests.length})</h4>
              <div className="reviewList">
                {openRequests.map(r => (
                  <article className="reviewRow" key={r.id}>
                    <div>
                      <b>{r.reviewer_name || (isEn ? 'Unnamed link' : 'Link senza nome')}</b>
                      <span className="muted">{r.reviewer_email || (isEn ? 'Share this link with them' : 'Condividi questo link con la persona')}</span>
                    </div>
                    <button type="button" className="btn" onClick={() => copyLink(r)}>{copiedId === r.id ? (isEn ? 'Copied ✓' : 'Copiato ✓') : t.copyLink}</button>
                  </article>
                ))}
              </div>
            </div>
          )}

          {pending.length > 0 && (
            <div className="reviewGroup">
              <h4><span className="reviewStatusDot dotPending" />{isEn ? 'Waiting for your approval' : 'Da approvare'} ({pending.length})</h4>
              <div className="reviewList">
                {pending.map(r => (
                  <article className="reviewRow reviewRowFull" key={r.id}>
                    <div>
                      <div className="pfStars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                      <p>{r.review_text}</p>
                      <b>{r.reviewer_name}</b>
                      <span className="muted">{[r.reviewer_role, r.reviewer_company].filter(Boolean).join(' · ')}</span>
                      {!r.consent_publication && <span className="tagPill">{isEn ? 'No publication consent given' : 'Non ha dato consenso alla pubblicazione'}</span>}
                    </div>
                    <div className="reviewRowActions">
                      <button type="button" className="btn primary" onClick={() => setReviewStatus(r, 'approved')}>{t.approve}</button>
                      <button type="button" className="btn" onClick={() => setReviewStatus(r, 'rejected')}>{t.reject}</button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {published.length > 0 && (
            <div className="reviewGroup">
              <h4><span className="reviewStatusDot dotPublished" />{isEn ? 'Published on your portfolio' : 'Pubblicate nel portfolio'} ({published.length})</h4>
              <div className="reviewList">
                {published.map(r => (
                  <article className="reviewRow reviewRowFull" key={r.id}>
                    <div>
                      <div className="pfStars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                      <p>{r.review_text}</p>
                      <b>{r.reviewer_name}</b>
                    </div>
                    <div className="reviewRowActions">
                      <button type="button" className="btn" onClick={() => toggleConsent(r)}>{t.unpublish}</button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {others.length > 0 && (
            <div className="reviewGroup">
              <h4><span className="reviewStatusDot dotOther" />{isEn ? 'Approved but not published / rejected' : 'Approvate ma non pubblicate / rifiutate'} ({others.length})</h4>
              <div className="reviewList">
                {others.map(r => (
                  <article className="reviewRow reviewRowFull" key={r.id}>
                    <div>
                      <div className="pfStars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                      <p>{r.review_text}</p>
                      <b>{r.reviewer_name}</b>
                      <span className="muted">{r.status === 'rejected' ? (isEn ? 'Rejected' : 'Rifiutata') : (isEn ? 'Approved, not published' : 'Approvata, non pubblicata')}</span>
                    </div>
                    <div className="reviewRowActions">
                      {r.status !== 'rejected' && (
                        <button type="button" className="btn primary" onClick={() => toggleConsent(r)}>{t.publish}</button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
