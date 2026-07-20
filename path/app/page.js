'use client';
import Link from 'next/link';
import { LanguageToggle, useLang } from '@/components/LanguageProvider';

const COPY = {
  it: {
    badge: 'CV digitale + Portfolio + QR + Analytics',
    heroTitle: 'Il CV tradizionale non racconta davvero chi sei.',
    heroText: 'QR Curriculum trasforma il profilo professionale in una vera pagina web: portfolio, video di presentazione, radar competenze, recensioni e QR code in un unico link.',
    heroCta: 'Crea il tuo QR Curriculum',
    heroSecondary: 'Scopri come funziona',
    mockLabel: 'Professional Portfolio',
    mockScore: 'Index 84/100',
    mockVideo: 'Video presentazione',
    steps: [
      { tag: 'P', cls: 'proofProblem', title: 'Problema', h: 'Il CV classico è statico, uguale per tutti e poco convincente.', p: 'Un PDF spesso non mostra progetti, competenze reali, recensioni, video, dati o aggiornamenti. Chi lo riceve deve interpretare tutto da poche righe.' },
      { tag: 'R', cls: 'proofRisk', title: 'Rischio', h: 'Se il profilo non comunica valore, viene ignorato.', p: 'Il rischio è perdere opportunità perché il CV non evidenzia abbastanza competenze, risultati, prove concrete e differenziazione rispetto agli altri candidati.' },
      { tag: 'S', cls: 'proofSolution', title: 'La nostra soluzione', h: 'Un portfolio professionale online collegato a QR code.', p: 'Crei una vera pagina pubblica con CV, video di presentazione, radar skill, Professional Index, recensioni, esperienze, progetti e case study.' },
      { tag: 'D', cls: 'proofDifference', title: 'La nostra differenza', h: 'Non è solo un CV online: è un profilo misurabile.', p: 'Il sistema aggiunge analytics, QR tracking, Job Match, Professional Index e una lettura più moderna delle competenze rispetto a un documento tradizionale.' },
      { tag: 'F', cls: 'proofFinal', title: 'Risultato finale', h: 'Una presentazione professionale più chiara, completa e memorabile.', p: 'Chi visita il profilo capisce meglio chi è la persona, cosa sa fare, quali risultati ha ottenuto e perché può essere interessante contattarla.' }
    ],
    whyTag: 'Perché usarlo',
    whyTitle: 'Una pagina professionale completa, semplice da condividere.',
    whyText: 'QR Curriculum unisce ciò che normalmente resta disperso tra CV, LinkedIn, portfolio, note personali e file PDF.',
    features: [
      { n: '01', title: 'Portfolio web', p: 'Una pagina pubblica con video, progetti, esperienze e recensioni: non un semplice CV online.' },
      { n: '02', title: 'QR code tracciato', p: 'Condividi il profilo su CV, biglietti, badge o materiali fisici e misura le scansioni.' },
      { n: '03', title: 'Professional Index', p: 'Un punteggio trasparente che racconta completezza, competenze, esperienza e reputazione.' },
      { n: '04', title: 'Job Match', p: 'Analizza la compatibilità tra competenze inserite e annunci di lavoro per capire cosa migliorare.' }
    ],
    flowTag: 'Flusso',
    flowTitle: 'Compili una volta, aggiorni nel tempo, condividi ovunque.',
    flowSteps: ['Inserisci dati, skill, esperienze e video.', 'Ottieni link pubblico e QR code.', 'Monitori visite, scansioni e miglioramenti.'],
    finalTitle: 'Vuoi trasformare il tuo CV in un profilo professionale digitale?',
    finalText: 'Parti dalla dashboard, compila il profilo e genera la tua pagina QR Curriculum.',
    finalCta: 'Inizia ora',
    footerPrivacy: 'Privacy Policy',
    footerCookie: 'Cookie Policy',
    manageCookies: 'Gestisci cookie'
  },
  en: {
    badge: 'Digital CV + Portfolio + QR + Analytics',
    heroTitle: 'A traditional CV never really tells people who you are.',
    heroText: 'QR Curriculum turns your professional profile into an actual web page: portfolio, intro video, skill radar, reviews and a QR code, all in a single link.',
    heroCta: 'Create your QR Curriculum',
    heroSecondary: 'See how it works',
    mockLabel: 'Professional Portfolio',
    mockScore: 'Index 84/100',
    mockVideo: 'Intro video',
    steps: [
      { tag: 'P', cls: 'proofProblem', title: 'Problem', h: 'The classic CV is static, the same for everyone, and unconvincing.', p: 'A PDF often can\'t show projects, real skills, reviews, video, data or updates. The reader has to guess everything from a few lines.' },
      { tag: 'R', cls: 'proofRisk', title: 'Risk', h: 'If a profile doesn\'t communicate value, it gets ignored.', p: 'The risk is losing opportunities because the CV doesn\'t highlight enough skills, results, concrete proof and differentiation from other candidates.' },
      { tag: 'S', cls: 'proofSolution', title: 'Our solution', h: 'An online professional portfolio linked to a QR code.', p: 'You build a real public page with CV, intro video, skill radar, Professional Index, reviews, experience, projects and case studies.' },
      { tag: 'D', cls: 'proofDifference', title: 'Our difference', h: 'Not just an online CV: a measurable profile.', p: 'The system adds analytics, QR tracking, Job Match, Professional Index and a more modern way to read skills than a traditional document.' },
      { tag: 'F', cls: 'proofFinal', title: 'The result', h: 'A clearer, more complete and more memorable professional presentation.', p: 'Visitors understand better who the person is, what they can do, what results they achieved, and why it\'s worth reaching out.' }
    ],
    whyTag: 'Why use it',
    whyTitle: 'A complete professional page, easy to share.',
    whyText: 'QR Curriculum brings together what is usually scattered across a CV, LinkedIn, portfolio, personal notes and PDF files.',
    features: [
      { n: '01', title: 'Web portfolio', p: 'A public page with video, projects, experience and reviews — not just an online CV.' },
      { n: '02', title: 'Tracked QR code', p: 'Share the profile on CVs, business cards, badges or printed material, and measure every scan.' },
      { n: '03', title: 'Professional Index', p: 'A transparent score that reflects completeness, skills, experience and reputation.' },
      { n: '04', title: 'Job Match', p: 'Compares your skills against job listings to see what to improve.' }
    ],
    flowTag: 'Flow',
    flowTitle: 'Fill it in once, update it over time, share it everywhere.',
    flowSteps: ['Add your details, skills, experience and video.', 'Get a public link and a tracked QR code.', 'Monitor visits, scans and improvements.'],
    finalTitle: 'Ready to turn your CV into a digital professional profile?',
    finalText: 'Start from the dashboard, fill in your profile and generate your QR Curriculum page.',
    finalCta: 'Get started',
    footerPrivacy: 'Privacy Policy',
    footerCookie: 'Cookie Policy',
    manageCookies: 'Manage cookies'
  }
};

export default function HomePage() {
  const { t, lang } = useLang();
  const c = COPY[lang] || COPY.it;

  function openCookies() {
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('open-cookie-preferences'));
  }

  return (
    <main className="marketingPage proofHome">
      <header className="marketingNav proofNav">
        <Link className="logoMark" href="/">QR<span>CV</span></Link>
        <nav>
          <LanguageToggle />
          <Link className="btn primary" href="/login">{t.login}</Link>
        </nav>
      </header>

      <section className="proofHero">
        <div className="proofHeroCopy">
          <span className="proofBadge">{c.badge}</span>
          <h1>{c.heroTitle}</h1>
          <p>{c.heroText}</p>
          <div className="proofHeroActions">
            <Link className="btn primary big" href="/login">{c.heroCta}</Link>
            <a className="btn big" href="#proof-framework">{c.heroSecondary}</a>
          </div>
        </div>
        <div className="proofMockup" aria-hidden="true">
          <div className="proofMockHeader"><i /><i /><i /></div>
          <div className="proofMockHero"><div><strong>{c.mockLabel}</strong><span>{c.mockScore}</span></div><div className="proofMockQr" /></div>
          <div className="proofMockVideo"><span>{c.mockVideo}</span></div>
          <div className="proofMockStats"><span /><span /><span /></div>
        </div>
      </section>

      <section id="proof-framework" className="proofFramework">
        {c.steps.map(s => (
          <article className={`proofStep ${s.cls}`} key={s.title}>
            <span>{s.tag}</span>
            <div><h2>{s.title}</h2><h3>{s.h}</h3><p>{s.p}</p></div>
          </article>
        ))}
      </section>

      <section className="proofFeatureSection">
        <div className="proofSectionIntro">
          <span>{c.whyTag}</span>
          <h2>{c.whyTitle}</h2>
          <p>{c.whyText}</p>
        </div>
        <div className="proofFeatureGrid">
          {c.features.map(f => (
            <article key={f.n}><strong>{f.n}</strong><h3>{f.title}</h3><p>{f.p}</p></article>
          ))}
        </div>
      </section>

      <section className="proofHowItWorks">
        <div><span>{c.flowTag}</span><h2>{c.flowTitle}</h2></div>
        <ol>
          {c.flowSteps.map((s, i) => <li key={s}><b>{i + 1}</b><strong>{s}</strong></li>)}
        </ol>
      </section>

      <section className="proofFinalCta">
        <h2>{c.finalTitle}</h2>
        <p>{c.finalText}</p>
        <Link className="btn primary big" href="/login">{c.finalCta}</Link>
      </section>

      <footer className="marketingFooter proofFooter">
        <b>QR Curriculum</b>
        <span>
          <Link href="/privacy-policy">{c.footerPrivacy}</Link> · <Link href="/cookie-policy">{c.footerCookie}</Link> · <button className="footerCookieBtn" onClick={openCookies}>{c.manageCookies}</button>
        </span>
      </footer>
    </main>
  );
}
