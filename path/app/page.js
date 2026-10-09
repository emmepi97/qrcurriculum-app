'use client';
import Link from 'next/link';
import { LanguageToggle, useLang } from '@/components/LanguageProvider';

const COPY = {
  it: {
    badge: 'CV professionale · ATS · QR · Analytics · Skill Radar',
    title: ['Digitalizza e', 'monitora il', 'tuo curriculum.'],
    text: 'Crea un curriculum professionale e ottimizzato per i sistemi ATS. Trasformalo in un profilo digitale condivisibile, misura l’interesse che genera e valorizza competenze e progetti in un unico spazio.',
    primary: 'Crea il tuo CV digitale',
    secondary: 'Scopri la piattaforma',
    login: 'Accedi',
    problemTitle: 'Il tuo valore merita più di un PDF.',
    problemText: 'Un curriculum efficace deve raccontare il tuo percorso in modo chiaro, essere strutturato per la lettura digitale e continuare a lavorare per te anche dopo che lo hai condiviso.',
    problemPoints: ['Struttura professionale e attenzione ai requisiti ATS', 'Visite e scansioni QR per capire l’interesse generato', 'Competenze e portfolio in un profilo sempre condivisibile'],
    proof1: 'CV ATS-friendly', proof2: 'QR tracciato', proof3: 'Portfolio online',
    featureEyebrow: 'UNA PIATTAFORMA, QUATTRO STRUMENTI',
    featureTitle: 'Tutto quello che serve per valorizzare la tua professionalità.',
    featureSubtitle: 'Dalla qualità del curriculum ai dati sul suo utilizzo: costruisci una presenza professionale completa.',
    cards: [
      ['CV professionale ottimizzato per ATS', 'Organizza esperienze, formazione e competenze in una struttura chiara, professionale e pensata per essere letta dai sistemi di selezione automatica.'],
      ['QR code e analytics', 'Condividi il CV con un QR code e consulta le visite e le scansioni registrate dalla piattaforma, con il relativo andamento nel tempo.'],
      ['Radar Skill e indice professionale', 'Rappresenta visivamente le tue competenze, organizza le skill per area e ottieni una fotografia più leggibile del tuo profilo.'],
      ['Portfolio online condivisibile', 'Raccogli progetti, case study, video e risultati in una pagina professionale da condividere anche fuori dal processo di selezione.'],
      ['Profilo digitale sempre aggiornato', 'Un unico link per presentare esperienze, progetti, competenze e informazioni professionali senza dipendere da un PDF statico.'],
      ['Referenze professionali', 'Raccogli testimonianze e pubblica le referenze che aiutano a raccontare meglio il tuo percorso e i risultati ottenuti.']
    ],
    howTitle: 'Dal curriculum ai dati, in tre passaggi.',
    how: ['Crea un CV ordinato con esperienze, formazione, progetti e competenze.', 'Condividi il tuo profilo tramite link pubblico, QR code e PDF.', 'Consulta le analytics disponibili e aggiorna il tuo portfolio nel tempo.'],
    finalTitle: 'La tua professionalità è più di un curriculum.',
    finalText: 'Costruisci una presenza professionale digitale, condivisibile e misurabile: parti dal CV e valorizza tutto ciò che sai fare.',
    privacy: 'Privacy Policy', cookie: 'Cookie Policy', cookies: 'Gestisci cookie'
  },
  en: {
    badge: 'Professional CV · ATS · QR · Analytics · Skill Radar',
    title: ['Make your CV', 'digital, measurable', 'and shareable.'],
    text: 'Create a professional resume structured for ATS systems. Turn it into a shareable digital profile, measure the interest it generates, and showcase your skills and projects in one place.',
    primary: 'Create your digital CV',
    secondary: 'Explore the platform',
    login: 'Login',
    problemTitle: 'Your value deserves more than a PDF.',
    problemText: 'An effective resume should tell your story clearly, be structured for digital reading, and keep working for you after you share it.',
    problemPoints: ['Professional structure with ATS-friendly content', 'Profile visits and QR scans recorded by the platform', 'Skills and portfolio in one shareable profile'],
    proof1: 'ATS-friendly CV', proof2: 'Tracked QR', proof3: 'Online portfolio',
    featureEyebrow: 'ONE PLATFORM, FOUR TOOLS',
    featureTitle: 'Everything you need to showcase your professional value.',
    featureSubtitle: 'From resume quality to engagement data: build a complete professional presence.',
    cards: [
      ['Professional ATS-friendly CV', 'Organize experience, education and skills in a clear professional structure designed to be readable by applicant tracking systems.'],
      ['QR code and analytics', 'Share your CV with a QR code and review profile visits and scans recorded by the platform over time.'],
      ['Skill Radar and professional index', 'Visualize your skills, organize them by area and get a clearer picture of your professional profile.'],
      ['Shareable online portfolio', 'Bring projects, case studies, videos and outcomes together in a professional page you can share beyond job applications.'],
      ['Always-updated digital profile', 'Use one link to present experience, projects and skills without relying on a static PDF.'],
      ['Professional references', 'Collect testimonials and publish references that help communicate your experience and achievements.']
    ],
    howTitle: 'From resume to insights in three steps.',
    how: ['Build a clear CV with experience, education, projects and skills.', 'Share your profile through a public link, QR code and PDF.', 'Review available analytics and keep your portfolio up to date.'],
    finalTitle: 'Your professional value is more than a resume.',
    finalText: 'Build a digital professional presence that is shareable and measurable: start with your CV and showcase what you can do.',
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
          <h1>{c.title.map((line) => <span key={line}>{line}</span>)}</h1>
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

      <section className="modernProblem" aria-labelledby="problem-title">
        <div className="modernProblemCopy"><span className="modernSectionTag">{lang === 'en' ? 'THE PROBLEM' : 'IL PROBLEMA'}</span><h2 id="problem-title">{c.problemTitle}</h2><p>{c.problemText}</p></div>
        <ul>{c.problemPoints.map(point => <li key={point}><span aria-hidden="true">✓</span>{point}</li>)}</ul>
      </section>

      <section className="modernFeaturesIntro" aria-labelledby="features-title">
        <span className="modernSectionTag">{c.featureEyebrow}</span>
        <h2 id="features-title">{c.featureTitle}</h2>
        <p>{c.featureSubtitle}</p>
      </section>

      <section id="features" className="modernFeatureGrid" aria-label={lang === 'en' ? 'Platform features' : 'Funzionalità della piattaforma'}>
        {c.cards.map(([title, text], index) => (
          <article key={title} className={`modernFeatureCard featureTone${index + 1}`}>
            <span className="modernFeatureNumber">{String(index + 1).padStart(2, '0')}</span>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="modernHow">
        <div><span>Workflow</span><h2>{c.howTitle}</h2></div>
        <ol>{c.how.map((step, index) => <li key={step}><b>{index + 1}</b>{step}</li>)}</ol>
      </section>

      <section className="modernFinal" id="inizia">
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
