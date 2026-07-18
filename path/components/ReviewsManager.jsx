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

  return (
    <section className="smartSection reviewsManager">
      <div className="smartSectionHeader">
        <div>
          <h2>{t.manageReviews}</h2>
          <p>{t.reviewsHelp}</p>
        </div>
      </div>

      <form className="quickForm reviewRequestForm" onSubmit={createRequest}>
        <label>{t.reviewerNameLabel}<input value={form.reviewer_name} onChange={e => setForm({ ...form, reviewer_name: e.target.value })} /></label>
        <label>{t.reviewerEmailLabel}<input type="email" value={form.reviewer_email} onChange={e => setForm({ ...form, reviewer_email: e.target.value })} /></label>
        <button className="btn primary" disabled={busy}>{t.generateLink}</button>
      </form>

      {loading ? <p className="hint">{t.loading}</p> : (
        <>
          {openRequests.length > 0 && (
            <div className="reviewGroup">
              <h4>{t.openRequests}</h4>
              <div className="reviewList">
                {openRequests.map(r => (
                  <article className="reviewRow" key={r.id}>
                    <div>
                      <b>{r.reviewer_name || (lang === 'en' ? 'Unnamed link' : 'Link senza nome')}</b>
                      <span className="muted">{r.reviewer_email}</span>
                    </div>
                    <button type="button" className="btn" onClick={() => copyLink(r)}>{copiedId === r.id ? '✓' : t.copyLink}</button>
                  </article>
                ))}
              </div>
            </div>
          )}

          {pending.length > 0 && (
            <div className="reviewGroup">
              <h4>{t.pendingReviews}</h4>
              <div className="reviewList">
                {pending.map(r => (
                  <article className="reviewRow reviewRowFull" key={r.id}>
                    <div>
                      <div className="pfStars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                      <p>{r.review_text}</p>
                      <b>{r.reviewer_name}</b>
                      <span className="muted">{[r.reviewer_role, r.reviewer_company].filter(Boolean).join(' · ')}</span>
                      {!r.consent_publication && <span className="tagPill">{lang === 'en' ? 'No publication consent' : 'Senza consenso pubblicazione'}</span>}
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

          {(published.length > 0 || others.length > 0) && (
            <div className="reviewGroup">
              <h4>{t.myReviews}</h4>
              <div className="reviewList">
                {[...published, ...others].map(r => {
                  const isPublished = r.status === 'approved' && r.consent_publication;
                  return (
                    <article className="reviewRow reviewRowFull" key={r.id}>
                      <div>
                        <div className="pfStars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                        <p>{r.review_text}</p>
                        <b>{r.reviewer_name}</b>
                        <span className="muted">{r.status}{r.status === 'rejected' ? '' : ''}</span>
                      </div>
                      <div className="reviewRowActions">
                        {r.status === 'approved' && (
                          <button type="button" className="btn" onClick={() => toggleConsent(r)}>
                            {isPublished ? t.unpublish : t.publish}
                          </button>
                        )}
                        {r.status !== 'approved' && (
                          <button type="button" className="btn primary" onClick={() => setReviewStatus(r, 'approved')}>{t.approve}</button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {openRequests.length === 0 && reviews.length === 0 && (
            <p className="muted">{lang === 'en' ? 'No review requests yet.' : 'Nessuna richiesta di recensione ancora.'}</p>
          )}
        </>
      )}
    </section>
  );
}
