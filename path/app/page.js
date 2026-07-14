'use client';
import Link from 'next/link';
import { LanguageToggle,useLang } from '@/components/LanguageProvider';

export default function HomePage(){
  const {t}=useLang();
  function openCookies(){if(typeof window!=='undefined')window.dispatchEvent(new Event('open-cookie-preferences'))}
  return <main className="marketingPage proofHome">
    <header className="marketingNav proofNav">
      <Link className="logoMark" href="/">QR<span>CV</span></Link>
      <nav><LanguageToggle/><Link className="btn primary" href="/login">{t.login}</Link></nav>
    </header>
    <section className="proofHero">
      <div className="proofHeroCopy">
        <span className="proofBadge">CV digitale + Portfolio + QR + Analytics</span>
        <h1>Il CV tradizionale non racconta davvero chi sei.</h1>
        <p>QR Curriculum trasforma il profilo professionale in una pagina web chiara, misurabile e condivisibile: CV, portfolio, radar competenze, recensioni, video e QR code in un unico link.</p>
        <div className="proofHeroActions"><Link className="btn primary big" href="/login">Crea il tuo QR Curriculum</Link><a className="btn big" href="#proof-framework">Scopri come funziona</a></div>
      </div>
      <div className="proofMockup" aria-hidden="true"><div className="proofMockHeader"><i/><i/><i/></div><div className="proofMockHero"><div><strong>Professional Portfolio</strong><span>Index 84/100</span></div><div className="proofMockQr"/></div><div className="proofMockVideo"><span>Video presentazione</span></div><div className="proofMockStats"><span/><span/><span/></div></div>
    </section>
    <section id="proof-framework" className="proofFramework">
      <article className="proofStep proofProblem"><span>P</span><div><h2>Problema</h2><h3>Il CV classico è statico, uguale per tutti e poco convincente.</h3><p>Un PDF spesso non mostra progetti, competenze reali, recensioni, video, dati o aggiornamenti. Chi lo riceve deve interpretare tutto da poche righe.</p></div></article>
      <article className="proofStep proofRisk"><span>R</span><div><h2>Rischio</h2><h3>Se il profilo non comunica valore, viene ignorato.</h3><p>Il rischio è perdere opportunità perché il CV non evidenzia abbastanza competenze, risultati, prove concrete e differenziazione rispetto agli altri candidati.</p></div></article>
      <article className="proofStep proofSolution"><span>O</span><div><h2>La nostra soluzione</h2><h3>Un portfolio professionale online collegato a QR code.</h3><p>L’utente crea una pagina pubblica con CV, video presentazione, radar skill, Professional Index, review, esperienze, progetti e case study.</p></div></article>
      <article className="proofStep proofDifference"><span>O</span><div><h2>La nostra differenza</h2><h3>Non è solo un CV online: è un profilo misurabile.</h3><p>Il sistema aggiunge analytics, QR tracking, Job Match, Professional Index e una lettura più moderna delle competenze rispetto a un documento tradizionale.</p></div></article>
      <article className="proofStep proofFinal"><span>F</span><div><h2>Risultato finale</h2><h3>Una presentazione professionale più chiara, completa e memorabile.</h3><p>Chi visita il profilo capisce meglio chi è la persona, cosa sa fare, quali risultati ha ottenuto e perché può essere interessante contattarla.</p></div></article>
    </section>
    <section className="proofFeatureSection"><div className="proofSectionIntro"><span>Perché usarlo</span><h2>Una pagina professionale completa, semplice da condividere.</h2><p>QR Curriculum unisce ciò che normalmente resta disperso tra CV, LinkedIn, portfolio, note personali e file PDF.</p></div><div className="proofFeatureGrid"><article><strong>01</strong><h3>Portfolio web</h3><p>Una pagina pubblica con informazioni dettagliate, progetti, esperienze, recensioni e video presentazione.</p></article><article><strong>02</strong><h3>QR code tracciato</h3><p>Condividi il profilo su CV, biglietti, badge o materiali fisici e misura le scansioni.</p></article><article><strong>03</strong><h3>Professional Index</h3><p>Un punteggio sintetico che aiuta a raccontare completezza, competenze, esperienza e reputazione.</p></article><article><strong>04</strong><h3>Job Match</h3><p>Analizza la compatibilità tra competenze inserite e annunci di lavoro per capire cosa migliorare.</p></article></div></section>
    <section className="proofHowItWorks"><div><span>Flusso</span><h2>Compili una volta, aggiorni nel tempo, condividi ovunque.</h2></div><ol><li><b>1</b><strong>Inserisci dati, skill, esperienze e video.</strong></li><li><b>2</b><strong>Ottieni link pubblico e QR code.</strong></li><li><b>3</b><strong>Monitori visite, scansioni e miglioramenti.</strong></li></ol></section>
    <section className="proofFinalCta"><h2>Vuoi trasformare il tuo CV in un profilo professionale digitale?</h2><p>Parti dalla dashboard, compila il profilo e genera la tua pagina QR Curriculum.</p><Link className="btn primary big" href="/login">Inizia ora</Link></section>
    <footer className="marketingFooter proofFooter"><b>QR Curriculum</b><span><Link href="/privacy-policy">Privacy Policy</Link> · <Link href="/cookie-policy">Cookie Policy</Link> · <button className="footerCookieBtn" onClick={openCookies}>Gestisci cookie</button></span></footer>
  </main>
}
