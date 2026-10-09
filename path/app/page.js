'use client';
import Link from 'next/link';
import { LanguageToggle, useLang } from '@/components/LanguageProvider';

const COPY = {
  it: {
    badge: 'IL TUO PROFILO PROFESSIONALE, EVOLUTO',
    title: ['Il tuo CV.', 'Molto più di un PDF.'],
    text: 'Crea un curriculum professionale pensato per gli ATS. Condividilo con un QR code, misura l’interesse che genera e valorizza competenze e progetti in un unico profilo digitale.',
    primary: 'Crea il tuo CV digitale',
    secondary: 'Esplora le funzionalità',
    login: 'Accedi',
    proof: ['CV ottimizzato per ATS', 'QR code tracciabile', 'Portfolio online'],
    featureEyebrow: 'UN PROFILO. PIÙ POSSIBILITÀ.',
    featureTitle: 'La tua professionalità, in una nuova prospettiva.',
    featureSubtitle: 'Tutto ciò che ti serve, senza complicazioni.',
    cards: [
      ['CV professionale', 'Una struttura chiara, curata e pensata per la lettura ATS.'],
      ['QR & Analytics', 'Scopri le visite e le scansioni registrate dalla piattaforma.'],
      ['Skill Radar', 'Visualizza le tue competenze con una grafica immediata.'],
      ['Portfolio online', 'Progetti e risultati, raccolti in un link da condividere.']
    ],
    howEyebrow: 'DAL CV AL PROFILO DIGITALE',
    howTitle: 'Crea. Condividi. Misura.',
    how: ['Costruisci il tuo curriculum', 'Condividi link e QR code', 'Monitora i dati disponibili'],
    finalTitle: 'Fai evolvere il tuo curriculum.',
    finalText: 'La tua esperienza merita uno spazio professionale all’altezza.',
    privacy: 'Privacy Policy', cookie: 'Cookie Policy', cookies: 'Gestisci cookie'
  },
  en: {
    badge: 'YOUR PROFESSIONAL PROFILE, EVOLVED',
    title: ['Your CV.', 'More than a PDF.'],
    text: 'Create a professional, ATS-friendly resume. Share it with a QR code, measure the interest it generates, and showcase your skills and projects in one digital profile.',
    primary: 'Create your digital CV',
    secondary: 'Explore features',
    login: 'Login',
    proof: ['ATS-friendly CV', 'Trackable QR code', 'Online portfolio'],
    featureEyebrow: 'ONE PROFILE. MORE POSSIBILITIES.',
    featureTitle: 'Your professional value, reimagined.',
    featureSubtitle: 'Everything you need, without the clutter.',
    cards: [
      ['Professional CV', 'A clear, polished structure designed for ATS readability.'],
      ['QR & Analytics', 'See profile visits and scans recorded by the platform.'],
      ['Skill Radar', 'Visualize your skills at a glance.'],
      ['Online portfolio', 'Projects and outcomes, gathered in one shareable link.']
    ],
    howEyebrow: 'FROM CV TO DIGITAL PROFILE',
    howTitle: 'Create. Share. Measure.',
    how: ['Build your resume', 'Share your link and QR code', 'Track available insights'],
    finalTitle: 'Take your CV to the next level.',
    finalText: 'Your experience deserves a professional space to match.',
    privacy: 'Privacy Policy', cookie: 'Cookie Policy', cookies: 'Manage cookies'
  }
};

function RadarGraphic() {
  return (
    <svg className="miniRadarSvg" viewBox="0 0 180 150" role="img" aria-label="Skill radar illustration">
      <g fill="none" stroke="rgba(184,205,255,.22)" strokeWidth="1">
        <polygon points="90,12 142,48 122,108 58,108 38,48" />
        <polygon points="90,32 125,56 112,95 68,95 55,56" />
        <polygon points="90,52 108,64 101,82 79,82 72,64" />
        <path d="M90 12V128M38 48L142 108M142 48L38 108M58 108L122 108M90 12L122 108" />
      </g>
      <polygon points="90,27 129,57 108,91 66,98 57,53" fill="rgba(80,214,255,.2)" stroke="#62ddff" strokeWidth="2.5" />
      <g fill="#b8f5dc"><circle cx="90" cy="27" r="3.5"/><circle cx="129" cy="57" r="3.5"/><circle cx="108" cy="91" r="3.5"/><circle cx="66" cy="98" r="3.5"/><circle cx="57" cy="53" r="3.5"/></g>
    </svg>
  );
}

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

      <section className="modernHero v22Hero">
        <div className="modernHeroCopy">
          <span className="modernBadge">{c.badge}</span>
          <h1>{c.title.map((line) => <span key={line}>{line}</span>)}</h1>
          <p>{c.text}</p>
          <div className="modernActions">
            <Link className="btn primary big" href="/login">{c.primary}<span aria-hidden="true"> ↗</span></Link>
            <a className="btn big v22Secondary" href="#features">{c.secondary}</a>
          </div>
          <div className="modernProofs">{c.proof.map(item => <span key={item}><i aria-hidden="true">✓</i>{item}</span>)}</div>
        </div>

        <div className="v22Visual" aria-label="Anteprima illustrativa della piattaforma">
          <div className="v22Glow" />
          <div className="v22Window">
            <div className="v22WindowTop"><div><i/><i/><i/></div><span>PROFESSIONAL PROFILE</span><b>•••</b></div>
            <div className="v22Profile">
              <div className="v22Avatar">MP</div>
              <div><strong>Professional profile</strong><span>CV · Skills · Portfolio</span></div>
              <div className="v22Status"><i/> LIVE</div>
            </div>
            <div className="v22Metrics">
              <div><span>PROFILE VIEWS</span><strong>+24%</strong><div className="v22Spark"><i/><i/><i/><i/><i/><i/><i/></div></div>
              <div><span>SKILLS</span><strong>Radar</strong><RadarGraphic /></div>
            </div>
            <div className="v22WindowBottom"><span><i/> QR PROFILE</span><span>Online portfolio <b>↗</b></span></div>
          </div>
          <div className="v22Float v22FloatQr"><div className="v22QrPattern" /><span>Il tuo QR<br/>professionale</span></div>
          <div className="v22Float v22FloatSkill"><span className="v22FloatIcon">✦</span><span><b>Skill Radar</b><small>Le tue competenze, a colpo d’occhio</small></span></div>
        </div>
      </section>

      <section className="v22FeatureSection" id="features">
        <div className="v22SectionHead">
          <span className="modernSectionTag">{c.featureEyebrow}</span>
          <h2>{c.featureTitle}</h2>
          <p>{c.featureSubtitle}</p>
        </div>
        <div className="v22FeatureGrid">
          <article className="v22FeatureCard v22CvCard">
            <div className="v22CardTop"><span className="v22Icon">▤</span><span className="v22CardIndex">01 / CV</span></div>
            <div className="v22CvMini"><div className="v22CvHead"><i/><span/><span/></div><div className="v22CvLines"><i/><i/><i/><i/></div><div className="v22CvTag">ATS READY</div></div>
            <h3>{c.cards[0][0]}</h3><p>{c.cards[0][1]}</p>
          </article>
          <article className="v22FeatureCard v22AnalyticsCard">
            <div className="v22CardTop"><span className="v22Icon">↗</span><span className="v22CardIndex">02 / DATA</span></div>
            <div className="v22ChartMini"><div className="v22ChartValue"><strong>Analytics</strong><span>Attività del profilo</span></div><div className="v22Bars">{[34,52,43,70,57,88,66,100,78,92].map((h,i)=><i key={i} style={{'--bar-height':`${h}%`}}/>)}</div><div className="v22ChartAxis"><span>INIZIO</span><span>OGGI</span></div></div>
            <h3>{c.cards[1][0]}</h3><p>{c.cards[1][1]}</p>
          </article>
          <article className="v22FeatureCard v22RadarCard">
            <div className="v22CardTop"><span className="v22Icon">✳</span><span className="v22CardIndex">03 / SKILLS</span></div>
            <div className="v22RadarMini"><RadarGraphic/><div><strong>Skill Radar</strong><span>Competenze per area</span></div></div>
            <h3>{c.cards[2][0]}</h3><p>{c.cards[2][1]}</p>
          </article>
          <article className="v22FeatureCard v22PortfolioCard">
            <div className="v22CardTop"><span className="v22Icon">◫</span><span className="v22CardIndex">04 / PORTFOLIO</span></div>
            <div className="v22PortfolioMini"><div className="v22PortfolioHero"><span>PROJECT<br/>SHOWCASE</span><i>↗</i></div><div className="v22PortfolioTiles"><i/><i/><i/></div></div>
            <h3>{c.cards[3][0]}</h3><p>{c.cards[3][1]}</p>
          </article>
        </div>
      </section>

      <section className="v22Flow">
        <div className="v22FlowHeading"><span className="modernSectionTag">{c.howEyebrow}</span><h2>{c.howTitle}</h2></div>
        <div className="v22FlowSteps">{c.how.map((step,index)=><div className="v22FlowStep" key={step}><span>{String(index+1).padStart(2,'0')}</span><p>{step}</p>{index<2&&<i aria-hidden="true">→</i>}</div>)}</div>
      </section>

      <section className="modernFinal v22Final" id="inizia">
        <div className="v22FinalOrb" aria-hidden="true"/>
        <span className="modernSectionTag">{lang === 'en' ? 'READY WHEN YOU ARE' : 'PRONTO QUANDO VUOI'}</span>
        <h2>{c.finalTitle}</h2>
        <p>{c.finalText}</p>
        <Link className="btn primary big" href="/login">{c.primary}<span aria-hidden="true"> ↗</span></Link>
      </section>

      <footer className="marketingFooter proofFooter modernFooter">
        <b>QR Curriculum</b>
        <span><Link href="/privacy-policy">{c.privacy}</Link> · <Link href="/cookie-policy">{c.cookie}</Link> · <button className="footerCookieBtn" onClick={openCookies}>{c.cookies}</button></span>
      </footer>
    </main>
  );
}
