'use client';
import { formatDateRange, formatMonthYear, levelLabels } from '@/lib/helpers';
import { useLang } from '@/components/LanguageProvider';
import ImagePreview from '@/components/ImagePreview';

function showDescription(row, field = 'description') {
  return !row.hide_description && row[field];
}

export default function CvTemplate({ data, qrCode }) {
  const { lang, t } = useLang();
  const p = data?.personal_info || {};
  const full = [p.nome, p.cognome].filter(Boolean).join(' ') || 'Il tuo nome';
  const work = data?.work_experiences || [];
  const ed = data?.educations || [];
  const langs = data?.languages || [];
  const skills = data?.skills || [];
  const awards = data?.awards || [];
  const projects = data?.projects || [];
  const cases = data?.case_studies || [];
  return <div className="cv-page" id="cv-document">
    <header className="header-flex">
      <div className="header-main">
        <h1>{full}</h1>
        {p.job_title ? <p className="headline">{p.job_title}</p> : null}
        <p className="contact-line">{[p.citta_residenza, p.nazione, p.email_cv, p.telefono].filter(Boolean).join(' · ')}</p>
      </div>
      {p.photo_url ? <div className="avatar-box"><ImagePreview url={p.photo_url} alt={full} /></div> : null}
    </header>
    {p.summary ? <section><h2>{lang === 'en' ? 'About me' : 'Chi sono'}</h2><p>{p.summary}</p></section> : null}
    {work.length ? <section><h2>{lang === 'en' ? 'Experience' : 'Esperienza'}</h2>{work.map(x => <div className="item" key={x.id}><div className="item-header"><h3>{x.role_title}{x.company ? ` — ${x.company}` : ''}</h3><span className="item-meta">{formatDateRange(x.start_date, x.end_date, lang)}</span></div>{showDescription(x) ? <p>{x.description}</p> : null}</div>)}</section> : null}
    {ed.length ? <section><h2>{lang === 'en' ? 'Education' : 'Formazione'}</h2>{ed.map(x => <div className="item" key={x.id}><div className="item-header"><h3>{x.title}{x.institution ? ` — ${x.institution}` : ''}</h3><span className="item-meta">{formatDateRange(x.start_date, x.end_date, lang)}</span></div><p>{[x.field_of_study, x.location, x.grade ? `Voto: ${x.grade}` : ''].filter(Boolean).join(' — ')}</p>{showDescription(x) ? <p>{x.description}</p> : null}</div>)}</section> : null}
    {langs.length ? <section><h2>{lang === 'en' ? 'Languages' : 'Lingue'}</h2><div className="lang-list">{langs.map(x => <span className="lang-pill" key={x.id}>{x.lingua} — {levelLabels[x.livello] || x.livello}</span>)}</div></section> : null}
    {skills.length ? <section><h2>{lang === 'en' ? 'Skills' : 'Competenze'}</h2>{skills.map(x => <span className="tag-pill" key={x.id}>{x.name} · {x.rating}/5</span>)}</section> : null}
    {awards.length ? <section><h2>{lang === 'en' ? 'Awards' : 'Premi e riconoscimenti'}</h2>{awards.map(x => <div className="item" key={x.id}><div className="item-header"><h3>{x.title}</h3><span className="item-meta">{[formatMonthYear(x.date, lang), x.issuer].filter(Boolean).join(' — ')}</span></div>{showDescription(x) ? <p>{x.description}</p> : null}</div>)}</section> : null}
    {projects.length ? <section><h2>{lang === 'en' ? 'Projects' : 'Progetti'}</h2>{projects.map(x => <div className="item" key={x.id}><div className="item-header"><h3>{x.title}{x.role ? ` — ${x.role}` : ''}</h3><span className="item-meta">{formatDateRange(x.start_date, x.end_date, lang)}</span></div>{showDescription(x) ? <p>{x.description}</p> : null}</div>)}</section> : null}
    {cases.length ? <section><h2>Case Study</h2>{cases.map(x => <div className="item" key={x.id}><div className="item-header"><h3>{x.title}</h3><span className="item-meta">{formatMonthYear(x.date, lang)}</span></div>{!x.hide_description ? <>{x.context ? <p><strong>Contesto:</strong> {x.context}</p> : null}{x.solution ? <p><strong>Soluzione:</strong> {x.solution}</p> : null}{x.impact ? <p><strong>Impatto:</strong> {x.impact}</p> : null}</> : null}</div>)}</section> : null}
    {qrCode ? <div className="qr-portfolio-block"><img src={qrCode} alt="QR portfolio" /><p className="qr-small-text">{lang === 'en' ? 'Scan to open the interactive portfolio.' : 'Scansiona per vedere il portfolio completo.'}</p></div> : null}
  </div>;
}
