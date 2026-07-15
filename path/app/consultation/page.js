'use client';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { useLang } from '@/components/LanguageProvider';
import AppTopbar from '@/components/AppTopbar';

const COPY = {
  it: {
    eyebrow: 'MIGLIORA IL TUO CV',
    title: 'Trasforma il tuo CV in uno strumento che genera colloqui',
    text: 'Analizziamo il tuo profilo, individuiamo i punti deboli e lo ottimizziamo per recruiter, sistemi ATS e Job Match Score.',
    offerTag: 'Offerta',
    offerTitle: 'Analisi gratuita + Ottimizzazione CV a 25€',
    offerText: 'Ricevi suggerimenti pratici e una versione migliorata del CV, pronta per le candidature.',
    steps: [
      { n: '1', title: 'Invii il tuo profilo', p: 'Ci lasci il link al tuo QR Curriculum o il CV attuale nel form qui sotto.' },
      { n: '2', title: 'Analizziamo tutto', p: 'Struttura, competenze, leggibilità, coerenza con il ruolo desiderato e compatibilità ATS.' },
      { n: '3', title: 'Ricevi il piano d\'azione', p: 'Un elenco chiaro di correzioni prioritarie, via email, entro 48 ore lavorative.' }
    ],
    whatTitle: 'Cosa ottieni',
    what: ['Analisi completa del profilo attuale', 'Elenco delle criticità principali', 'Consigli personalizzati sul contenuto', 'Revisione di struttura e layout', 'Miglioramento del Job Match Score', 'Supporto nella fase di candidatura'],
    forTitle: 'Per chi è utile',
    forWho: ['Studenti al primo CV', 'Professionisti in cerca di crescita', 'Manager e dirigenti', 'Chi è tornato a cercare lavoro'],
    faqTitle: 'Domande frequenti',
    faq: [
      { q: 'L\'analisi iniziale è davvero gratuita?', a: 'Sì: la prima valutazione del profilo è sempre gratuita. Paghi solo se vuoi procedere con l\'ottimizzazione completa.' },
      { q: 'Quanto tempo serve?', a: 'Ricevi una prima risposta entro 48 ore lavorative dall\'invio della richiesta.' },
      { q: 'Serve avere già un CV su QR Curriculum?', a: 'No, puoi anche solo incollare il link a un CV esistente o descrivere il tuo obiettivo professionale.' }
    ],
    formTitle: 'Richiedi la consulenza',
    name: 'Nome', email: 'Email', phone: 'Telefono', message: 'Messaggio',
    messagePlaceholder: 'Incolla il link del CV o descrivi il tuo obiettivo professionale.',
    submit: 'Richiedi consulenza', sending: 'Invio...',
    success: 'Richiesta inviata. Ti contatteremo a breve.',
    errorGeneric: 'Errore durante l\'invio della richiesta.'
  },
  en: {
    eyebrow: 'IMPROVE YOUR CV',
    title: 'Turn your CV into a tool that gets you interviews',
    text: 'We review your profile, spot the weak points, and optimize it for recruiters, ATS systems and your Job Match Score.',
    offerTag: 'Offer',
    offerTitle: 'Free review + CV optimization for €25',
    offerText: 'Get practical suggestions and an improved CV, ready for job applications.',
    steps: [
      { n: '1', title: 'Send us your profile', p: 'Share your QR Curriculum link or your current CV in the form below.' },
      { n: '2', title: 'We review everything', p: 'Structure, skills, readability, fit with your target role and ATS compatibility.' },
      { n: '3', title: 'You get an action plan', p: 'A clear list of priority fixes, sent by email within 48 business hours.' }
    ],
    whatTitle: 'What you get',
    what: ['Full review of your current profile', 'List of the main weak points', 'Personalized content advice', 'Structure and layout revision', 'Improved Job Match Score', 'Support during the application phase'],
    forTitle: 'Who it\'s for',
    forWho: ['Students writing their first CV', 'Professionals looking to grow', 'Managers and executives', 'People returning to the job market'],
    faqTitle: 'Frequently asked questions',
    faq: [
      { q: 'Is the first review really free?', a: 'Yes: the initial profile review is always free. You only pay if you want the full optimization.' },
      { q: 'How long does it take?', a: 'You get a first reply within 48 business hours from your request.' },
      { q: 'Do I need an existing QR Curriculum?', a: 'No, you can just paste a link to your current CV or describe your professional goal.' }
    ],
    formTitle: 'Request the review',
    name: 'Name', email: 'Email', phone: 'Phone', message: 'Message',
    messagePlaceholder: 'Paste your CV link or describe your professional goal.',
    submit: 'Request the review', sending: 'Sending...',
    success: 'Request sent. We\'ll get back to you shortly.',
    errorGeneric: 'Something went wrong while sending your request.'
  }
};

export default function ConsultationPage() {
  const { lang } = useLang();
  const c = COPY[lang] || COPY.it;
  const [session, setSession] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user?.email) setForm(f => ({ ...f, email: data.session.user.email }));
    });
  }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      const payload = {
        user_id: session?.user?.id || null,
        email: form.email,
        name: form.name,
        phone: form.phone,
        message: form.message,
        source: 'consultation_form_submit',
        status: 'requested',
        price_eur: 25
      };
      const res = await fetch('/api/consultation-click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(c.errorGeneric);
      setMsg(c.success);
      setForm(f => ({ name: '', email: f.email, phone: '', message: '' }));
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <AppTopbar email={session?.user?.email} />

      <section className="heroPanel">
        <div className="cleanHero">
          <div className="eyebrow">{c.eyebrow}</div>
          <h1>{c.title}</h1>
          <p>{c.text}</p>
        </div>
        <div className="cvHeroCard">
          <span>{c.offerTag}</span>
          <strong>{c.offerTitle}</strong>
          <p>{c.offerText}</p>
        </div>
      </section>

      <main className="pageWrap consultationLanding">
        <section className="consultationSteps">
          {c.steps.map(s => (
            <article className="consultationStepCard" key={s.n}>
              <span className="consultationStepNum">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.p}</p>
            </article>
          ))}
        </section>

        <section className="consultationGrid">
          <article className="consultationCard">
            <h2>{c.whatTitle}</h2>
            <ul>{c.what.map(x => <li key={x}>{x}</li>)}</ul>
            <h2>{c.forTitle}</h2>
            <ul>{c.forWho.map(x => <li key={x}>{x}</li>)}</ul>
          </article>

          <article className="consultationCard">
            <h2>{c.formTitle}</h2>
            <form onSubmit={submit} className="quickForm">
              <label>{c.name}<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
              <label>{c.email}<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></label>
              <label>{c.phone}<input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
              <label>{c.message}<textarea rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder={c.messagePlaceholder} /></label>
              <button className="btn primary big" disabled={busy}>{busy ? c.sending : c.submit}</button>
              {msg && <p className="formFeedback">{msg}</p>}
            </form>
          </article>
        </section>

        <section className="consultationFaq">
          <h2>{c.faqTitle}</h2>
          <div className="consultationFaqList">
            {c.faq.map(f => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
