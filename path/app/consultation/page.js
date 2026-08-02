'use client';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { useLang } from '@/components/LanguageProvider';
import AppTopbar from '@/components/AppTopbar';

const COPY = {
  it: {
    eyebrow: 'MIGLIORA IL TUO CV',
    title: 'Il tuo CV lavora per te, o ti sta facendo perdere occasioni?',
    text: 'Analisi gratuita + ottimizzazione professionale, per un CV che i recruiter notano davvero e che i sistemi ATS non scartano.',
    heroCta: 'Richiedi l\'analisi gratuita',

    problemTag: 'IL PROBLEMA',
    problemTitle: 'La maggior parte dei CV viene scartata prima ancora di essere letta',
    problems: [
      { h: 'Filtrato dagli ATS', p: 'Molte aziende usano software (ATS) che scansionano il CV prima che un umano lo veda: formattazioni sbagliate o parole chiave mancanti lo fanno scartare in automatico.' },
      { h: 'Generico e anonimo', p: 'Stesso CV per ogni candidatura: non parla del ruolo specifico, non emerge tra centinaia di altri profili simili.' },
      { h: 'Risultati non misurabili', p: 'Elenca mansioni invece di risultati concreti: il recruiter non capisce il valore reale che hai portato.' },
      { h: 'Struttura confusa', p: 'Informazioni importanti nascoste in mezzo al testo, layout poco chiaro: chi legge decide in pochi secondi se continuare o no.' }
    ],

    resultsTag: 'I RISULTATI',
    resultsTitle: 'Cosa cambia con un CV ottimizzato',
    results: [
      'Passa i filtri ATS più facilmente, grazie a struttura e parole chiave corrette',
      'Comunica il tuo valore con risultati concreti, non solo mansioni',
      'Si legge in pochi secondi: chiaro, ordinato, mirato al ruolo',
      'Aumenta il Job Match Score con gli annunci che ti interessano davvero',
      'Ti distingue dagli altri candidati con lo stesso profilo'
    ],

    solutionTag: 'LA SOLUZIONE',
    solutionTitle: 'Come funziona, passo per passo',
    steps: [
      { n: '1', title: 'Invii il tuo profilo', p: 'Condividi il link del tuo QR Curriculum o il CV attuale nel form qui sotto.' },
      { n: '2', title: 'Analizziamo tutto', p: 'Struttura, competenze, leggibilità, coerenza con il ruolo desiderato e compatibilità ATS.' },
      { n: '3', title: 'Ricevi il piano d\'azione', p: 'Un elenco chiaro di correzioni prioritarie via email, entro 48 ore lavorative.' },
      { n: '4', title: 'Se vuoi, lo ottimizziamo noi', p: 'Con l\'opzione a pagamento riscriviamo e restituiamo il CV pronto per le candidature.' }
    ],
    offerTag: 'Offerta',
    offerTitle: 'Analisi gratuita + Ottimizzazione CV a 25€',
    offerText: 'La prima valutazione è sempre gratuita. Paghi solo se vuoi procedere con la riscrittura completa.',

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

    ctaTag: 'INIZIA ORA',
    formTitle: 'Richiedi la tua analisi gratuita',
    formSubtitle: 'Rispondiamo entro 48 ore lavorative. Nessun impegno.',
    name: 'Nome', email: 'Email', phone: 'Telefono', message: 'Messaggio',
    messagePlaceholder: 'Incolla il link del CV o descrivi il tuo obiettivo professionale.',
    submit: 'Richiedi l\'analisi gratuita', sending: 'Invio...',
    success: 'Richiesta inviata. Ti contatteremo a breve.',
    errorGeneric: 'Errore durante l\'invio della richiesta.'
  },
  en: {
    eyebrow: 'IMPROVE YOUR CV',
    title: 'Is your CV working for you, or costing you opportunities?',
    text: 'Free review + professional optimization, for a CV recruiters actually notice and ATS systems don\'t reject.',
    heroCta: 'Request the free review',

    problemTag: 'THE PROBLEM',
    problemTitle: 'Most CVs get rejected before a human even reads them',
    problems: [
      { h: 'Filtered out by ATS', p: 'Many companies use software (ATS) that scans your CV before a human sees it: wrong formatting or missing keywords get it auto-rejected.' },
      { h: 'Generic and anonymous', p: 'Same CV for every application: it doesn\'t speak to the specific role, and doesn\'t stand out among hundreds of similar profiles.' },
      { h: 'Results you can\'t measure', p: 'Lists duties instead of concrete results: the recruiter can\'t see the real value you brought.' },
      { h: 'Confusing structure', p: 'Important info buried in the text, unclear layout: readers decide in seconds whether to keep reading.' }
    ],

    resultsTag: 'THE RESULTS',
    resultsTitle: 'What changes with an optimized CV',
    results: [
      'Passes ATS filters more easily, thanks to correct structure and keywords',
      'Communicates your value through concrete results, not just duties',
      'Reads in seconds: clear, organized, targeted to the role',
      'Increases your Job Match Score against the roles you actually want',
      'Sets you apart from other candidates with a similar profile'
    ],

    solutionTag: 'THE SOLUTION',
    solutionTitle: 'How it works, step by step',
    steps: [
      { n: '1', title: 'Send us your profile', p: 'Share your QR Curriculum link or your current CV in the form below.' },
      { n: '2', title: 'We review everything', p: 'Structure, skills, readability, fit with your target role and ATS compatibility.' },
      { n: '3', title: 'You get an action plan', p: 'A clear list of priority fixes, sent by email within 48 business hours.' },
      { n: '4', title: 'If you want, we optimize it', p: 'With the paid option we rewrite and return your CV ready for applications.' }
    ],
    offerTag: 'Offer',
    offerTitle: 'Free review + CV optimization for €25',
    offerText: 'The first review is always free. You only pay if you want the full rewrite.',

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

    ctaTag: 'GET STARTED',
    formTitle: 'Request your free review',
    formSubtitle: 'We reply within 48 business hours. No obligation.',
    name: 'Name', email: 'Email', phone: 'Phone', message: 'Message',
    messagePlaceholder: 'Paste your CV link or describe your professional goal.',
    submit: 'Request the free review', sending: 'Sending...',
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

  function scrollToForm() {
    document.getElementById('consultation-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

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
          <button type="button" className="btn primary big" onClick={scrollToForm}>{c.heroCta}</button>
        </div>
        <div className="cvHeroCard">
          <span>{c.offerTag}</span>
          <strong>{c.offerTitle}</strong>
          <p>{c.offerText}</p>
        </div>
      </section>

      <main className="pageWrap consultationLanding">
        <section className="landingBlock">
          <span className="landingTag landingTagProblem">{c.problemTag}</span>
          <h2>{c.problemTitle}</h2>
          <div className="landingGrid4">
            {c.problems.map(p => (
              <article className="landingCard" key={p.h}>
                <h3>{p.h}</h3>
                <p>{p.p}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landingBlock landingBlockDark">
          <span className="landingTag landingTagResults">{c.resultsTag}</span>
          <h2>{c.resultsTitle}</h2>
          <ul className="landingResultsList">
            {c.results.map(r => <li key={r}><span className="landingCheck">✓</span>{r}</li>)}
          </ul>
        </section>

        <section className="landingBlock">
          <span className="landingTag landingTagSolution">{c.solutionTag}</span>
          <h2>{c.solutionTitle}</h2>
          <div className="consultationSteps">
            {c.steps.map(s => (
              <article className="consultationStepCard" key={s.n}>
                <span className="consultationStepNum">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.p}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="consultationGrid">
          <article className="consultationCard">
            <h2>{c.whatTitle}</h2>
            <ul>{c.what.map(x => <li key={x}>{x}</li>)}</ul>
            <h2>{c.forTitle}</h2>
            <ul>{c.forWho.map(x => <li key={x}>{x}</li>)}</ul>
          </article>

          <article className="consultationCard" id="consultation-form">
            <span className="landingTag landingTagCta">{c.ctaTag}</span>
            <h2>{c.formTitle}</h2>
            <p className="hint">{c.formSubtitle}</p>
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
