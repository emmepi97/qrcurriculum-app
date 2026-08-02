'use client';
import Link from 'next/link';
import { LanguageToggle, useLang } from '@/components/LanguageProvider';

const COPY = {
  it: {
    badge: 'CV digitale, QR code e portfolio professionale',
    title: 'Il tuo curriculum diventa una presenza professionale online.',
    text: 'Crea un profilo chiaro, moderno e condivisibile: esperienze, competenze, progetti, recensioni, video e QR code in un unico spazio sempre aggiornato.',
    primary: 'Crea il tuo CV digitale',
    secondary: 'Guarda le funzionalità',
    login: 'Accedi',
    proof1: 'Profilo pubblico', proof2: 'QR tracciato', proof3: 'PDF scaricabile',
    cards: [
      ['CV digitale', 'Un profilo online ordinato, aggiornabile e leggibile da recruiter, aziende e collaboratori.'],
      ['Portfolio concreto', 'Mostra progetti, case study, competenze, video e risultati, non solo mansioni.'],
      ['Recensioni professionali', 'Raccogli referenze, approva e pubblica solo quelle che rafforzano il tuo profilo.'],
      ['Analytics e QR', 'Condividi il QR e monitora visite, scansioni e interesse reale sul tuo profilo.']
    ],
    howTitle: 'Tre passaggi, nessuna complessità.',
    how: ['Compili dati, esperienze e competenze.', 'Generi link pubblico, QR code e PDF.', 'Aggiorni il profilo e misuri le visite nel tempo.'],
    finalTitle: 'Porta il tuo CV fuori dal PDF statico.',
    finalText: 'Trasforma il curriculum in uno spazio professionale più completo, più credibile e più facile da condividere.',
    privacy: 'Privacy Policy', cookie: 'Cookie Policy', cookies: 'Gestisci cookie'
  },
  en: {
    badge: 'Digital CV, QR code and professional portfolio',
    title: 'Your resume becomes a professional online presence.',
    text: 'Create a clear, modern and shareable profile: experience, skills, projects, reviews, video and QR code in one always-updated space.',
    primary: 'Create your digital CV',
    secondary: 'Explore features',
    login: 'Login',
    proof1: 'Public profile', proof2: 'Tracked QR', proof3: 'Downloadable PDF',
    cards: [
      ['Digital CV', 'An online profile that is clean, updatable and easy for recruiters, companies and collaborators to read.'],
      ['Concrete portfolio', 'Show projects, case studies, skills, videos and outcomes, not only job duties.'],
      ['Professional reviews', 'Collect testimonials, approve them and publish only the ones that strengthen your profile.'],
      ['Analytics and QR', 'Share your QR code and monitor visits, scans and real interest in your profile.']
    ],
    howTitle: 'Three steps, no complexity.',
    how: ['Add your details, experience and skills.', 'Generate your public link, QR code and PDF.', 'Update your profile and track visits over time.'],
    finalTitle: 'Move your CV beyond a static PDF.',
    finalText: 'Turn your resume into a professional space that is more complete, credible and easy to share.',
    privacy: 'Privacy Policy', cookie: 'Cookie Policy', cookies: 'Manage cookies'
  }
};

export default function HomePage() {
  const { lang } = useLang();
  const c = COPY[lang] || COPY.it;
  function openCookies() {
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('open-cookie-preferences'));
  }
  return (
    <main className="modernHome">
      <header className="modernNav">
        <Link className="modernLogo" href="/">QR Curriculum</Link>
        <nav>
          <LanguageToggle />
          <Link className="btn" href="/login">{c.login}</Link>
        </nav>
      </header>

      <section className="modernHero">
        <div className="modernHeroCopy">
          <span className="modernBadge">{c.badge}</span>
          <h1>{c.title}</h1>
          <p>{c.text}</p>
          <div className="modernActions">
            <Link className="btn primary big" href="/login">{c.primary}</Link>
            <a className="btn big" href="#features">{c.secondary}</a>
          </div>
          <div className="modernProofs">
            <span>{c.proof1}</span><span>{c.proof2}</span><span>{c.proof3}</span>
          </div>
        </div>
        <div className="modernPreview" aria-hidden="true">
          <div className="previewTop"><span /><span /><span /></div>
          <div className="previewProfile"><div className="avatarMock" /><div><strong>Professional profile</strong><p>Portfolio, skill radar, reviews</p></div></div>
          <div className="previewGrid"><span /><span /><span /><span /></div>
          <div className="previewQr"><i /><div><b>QR Code</b><p>Tracked scans and profile visits</p></div></div>
        </div>
      </section>

      <section id="features" className="modernFeatureGrid">
        {c.cards.map(([title, text]) => <article key={title}><h2>{title}</h2><p>{text}</p></article>)}
      </section>

      <section className="modernHow">
        <div><span>Workflow</span><h2>{c.howTitle}</h2></div>
        <ol>{c.how.map((step, index) => <li key={step}><b>{index + 1}</b>{step}</li>)}</ol>
      </section>

      <section className="modernFinal">
        <h2>{c.finalTitle}</h2>
        <p>{c.finalText}</p>
        <Link className="btn primary big" href="/login">{c.primary}</Link>
      </section>

      <footer className="marketingFooter proofFooter modernFooter">
        <b>QR Curriculum</b>
        <span><Link href="/privacy-policy">{c.privacy}</Link> · <Link href="/cookie-policy">{c.cookie}</Link> · <button className="footerCookieBtn" onClick={openCookies}>{c.cookies}</button></span>
      </footer>
    </main>
  );
}
