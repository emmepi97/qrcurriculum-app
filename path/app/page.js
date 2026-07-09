'use client';
import Link from 'next/link';
import { LanguageToggle, useLang } from '@/components/LanguageProvider';

export default function HomePage(){
  const { t } = useLang();
  return (
    <main className="marketingPage">
      <header className="marketingNav">
        <Link href="/" className="logoMark">QR<span>CV</span></Link>
        <nav>
          <Link href="/privacy-policy">{t.privacy}</Link>
          <Link href="/cookie-policy">{t.cookie}</Link>
          <LanguageToggle />
          <Link href="/login" className="btn primary">{t.login}</Link>
        </nav>
      </header>
      <section className="marketingHero">
        <div className="heroCopy">
          <span className="badge">{t.homeBadge}</span>
          <h1>{t.homeTitle}</h1>
          <p>{t.homeSubtitle}</p>
          <div className="heroCtas">
            <Link href="/login" className="btn primary big">{t.homeCta}</Link>
            <Link href="/radar-skill" className="btn big">{t.homeSecondary}</Link>
          </div>
          <div className="trustStrip">
            <span>{t.homeFeature1}</span><span>{t.homeFeature2}</span><span>{t.homeFeature3}</span><span>{t.homeFeature4}</span>
          </div>
        </div>
        <div className="browserCard">
          <div className="browserTop"><i></i><i></i><i></i></div>
          <div className="profileMock"><div><h3>Matteo Poggesi</h3><p>Process & Planning Specialist</p></div><div className="qrMock"></div></div>
          <div className="mockLine large"></div><div className="mockLine"></div><div className="mockGrid"><span></span><span></span><span></span></div>
        </div>
      </section>
      <section className="featureGrid">
        <article><strong>01</strong><h3>{t.homeFeature1}</h3><p>{t.homeDesc1}</p></article>
        <article><strong>02</strong><h3>{t.homeFeature2}</h3><p>{t.homeDesc2}</p></article>
        <article><strong>03</strong><h3>{t.homeFeature3}</h3><p>{t.homeDesc3}</p></article>
        <article><strong>04</strong><h3>{t.homeFeature4}</h3><p>{t.homeDesc4}</p></article>
      </section>
      <footer className="marketingFooter"><strong>QR Curriculum</strong><span>Privacy Policy · Cookie Policy</span></footer>
    </main>
  );
}
