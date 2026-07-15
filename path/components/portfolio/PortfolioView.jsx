'use client';
import ImagePreview from '@/components/ImagePreview';
import {
  categoryLabel,
  fieldVisible,
  formatDateRange,
  getYouTubeEmbedUrl,
  isVisibleInLang,
  levelLabels,
  normalizeCategory,
  skillExperienceLabel
} from '@/lib/helpers';

function visible(list, lang) {
  return (list || []).filter(x => !x.is_hidden && isVisibleInLang(x, lang));
}

function hasDescription(x) {
  return !x.hide_description && fieldVisible(x, 'description') && x.description;
}

function PfSection({ id, title, children, tone }) {
  if (!children) return null;
  return (
    <section id={id} className={`pfSection ${tone || ''}`}>
      <h2 className="pfSectionTitle">{title}</h2>
      {children}
    </section>
  );
}

export default function PortfolioView({ data, qrCode, lang, worker, publicUrl }) {
  const p = data?.personal_info || {};
  const full = [p.nome, p.cognome].filter(Boolean).join(' ') || (lang === 'en' ? 'Your name' : 'Il tuo nome');
  const contactBits = [p.citta_residenza, p.nazione].filter(Boolean);

  const work = visible(data?.work_experiences, lang);
  const education = visible(data?.educations, lang);
  const languages = visible(data?.languages, lang);
  const skills = visible(data?.skills, lang);
  const awards = visible(data?.awards, lang);
  const projects = visible(data?.projects, lang);
  const caseStudies = visible(data?.case_studies, lang);
  const availability = data?.professional_availability;
  const reviews = data?.portfolio_reviews || [];
  const hasAvailability = availability && (availability.open_to_work || availability.consulting || availability.freelance || availability.networking || availability.teaching || availability.collaborations);
  const embedUrl = getYouTubeEmbedUrl(p.video_url);

  const skillsByCategory = {};
  skills.forEach(s => {
    const cat = normalizeCategory(s.category);
    skillsByCategory[cat] = skillsByCategory[cat] || [];
    skillsByCategory[cat].push(s);
  });

  return (
    <div className="pfPage">
      <section className="pfHero">
        <div className="pfHeroInner">
          {p.photo_url && <div className="pfAvatar"><ImagePreview url={p.photo_url} alt={full} /></div>}
          <div className="pfHeroText">
            <h1>{full}</h1>
            {p.job_title && <p className="pfHeadline">{p.job_title}</p>}
            {contactBits.length > 0 && <p className="pfLocation">{contactBits.join(' · ')}</p>}
            {p.summary && <p className="pfSummary">{p.summary}</p>}
            <div className="pfHeroActions">
              {p.email_cv && <a className="btn primary" href={`mailto:${p.email_cv}`}>{lang === 'en' ? 'Get in touch' : 'Contattami'}</a>}
              {embedUrl && <a className="btn" href="#pfVideo">{lang === 'en' ? 'Watch the video' : 'Guarda il video'}</a>}
            </div>
            {hasAvailability && (
              <div className="pfAvailability">
                {availability.open_to_work && <span className="pfPill">{lang === 'en' ? 'Open to work' : 'Aperto a nuove opportunità'}</span>}
                {availability.consulting && <span className="pfPill">{lang === 'en' ? 'Consulting' : 'Consulenze'}</span>}
                {availability.freelance && <span className="pfPill">Freelance</span>}
                {availability.networking && <span className="pfPill">Networking</span>}
                {availability.teaching && <span className="pfPill">{lang === 'en' ? 'Teaching' : 'Docenze'}</span>}
                {availability.collaborations && <span className="pfPill">{lang === 'en' ? 'Collaborations' : 'Collaborazioni'}</span>}
              </div>
            )}
          </div>
          {worker && (
            <div className="pfScoreBadge">
              <div className="scoreCircle" style={{ '--score': `${worker.score}%` }}><strong>{worker.score}</strong></div>
              <span>{lang === 'en' ? 'Professional Index' : 'Professional Index'}</span>
            </div>
          )}
        </div>
      </section>

      {embedUrl && (
        <section id="pfVideo" className="pfSection pfVideoSection">
          <h2 className="pfSectionTitle">{lang === 'en' ? 'Introduction video' : 'Video di presentazione'}</h2>
          <div className="pfVideoFrame">
            <iframe
              src={embedUrl}
              title={lang === 'en' ? 'Introduction video' : 'Video di presentazione'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      {(work.length > 0 || projects.length > 0 || caseStudies.length > 0) && (
        <section className="pfSection pfTimelineSection">
          <h2 className="pfSectionTitle">{lang === 'en' ? 'Experience & projects' : 'Esperienza e progetti'}</h2>
          <div className="pfTimeline">
            {work.map(x => (
              <article className="pfTimelineItem" key={`w-${x.id}`}>
                <span className="pfTimelineDate">{formatDateRange(x.start_date, x.end_date, lang)}</span>
                <div>
                  <h3>{[fieldVisible(x, 'role_title') ? x.role_title : '', fieldVisible(x, 'company') ? x.company : ''].filter(Boolean).join(' · ')}</h3>
                  {hasDescription(x) && <p>{x.description}</p>}
                </div>
              </article>
            ))}
          </div>
          {(projects.length > 0 || caseStudies.length > 0) && (
            <div className="pfProjectGrid">
              {projects.map(x => (
                <article className="pfProjectCard" key={`p-${x.id}`}>
                  <span className="pfProjectTag">{lang === 'en' ? 'Project' : 'Progetto'}</span>
                  <h3>{fieldVisible(x, 'title') ? x.title : ''}</h3>
                  {fieldVisible(x, 'role') && x.role && <p className="pfProjectRole">{x.role}</p>}
                  {hasDescription(x) && <p>{x.description}</p>}
                  <span className="pfProjectDate">{formatDateRange(x.start_date, x.end_date, lang)}</span>
                </article>
              ))}
              {caseStudies.map(x => (
                <article className="pfProjectCard" key={`cs-${x.id}`}>
                  <span className="pfProjectTag">Case study</span>
                  <h3>{x.title}</h3>
                  {!x.hide_description && (
                    <>
                      {x.context && <p><b>{lang === 'en' ? 'Context' : 'Contesto'}:</b> {x.context}</p>}
                      {x.solution && <p><b>{lang === 'en' ? 'Solution' : 'Soluzione'}:</b> {x.solution}</p>}
                      {x.impact && <p><b>{lang === 'en' ? 'Impact' : 'Impatto'}:</b> {x.impact}</p>}
                    </>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {skills.length > 0 && (
        <section className="pfSection pfSkillsSection">
          <h2 className="pfSectionTitle">{lang === 'en' ? 'Skills' : 'Competenze'}</h2>
          <div className="pfSkillGroups">
            {Object.entries(skillsByCategory).map(([cat, list]) => (
              <div className="pfSkillGroup" key={cat}>
                <h4>{categoryLabel(cat, lang)}</h4>
                <div className="pfSkillTags">
                  {list.map(s => {
                    const exp = skillExperienceLabel(s.acquired_date, lang);
                    return (
                      <span className="tagPill" key={s.id}>
                        {s.name}{!s.hide_score && fieldVisible(s, 'rating') ? ` · ${s.rating}/5` : ''}{exp ? ` · ${exp}` : ''}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section className="pfSection pfEduSection">
          <h2 className="pfSectionTitle">{lang === 'en' ? 'Education' : 'Formazione'}</h2>
          <div className="pfTimeline">
            {education.map(x => (
              <article className="pfTimelineItem" key={x.id}>
                <span className="pfTimelineDate">{formatDateRange(x.start_date, x.end_date, lang)}</span>
                <div>
                  <h3>{[fieldVisible(x, 'title') ? x.title : '', fieldVisible(x, 'institution') ? x.institution : ''].filter(Boolean).join(' · ')}</h3>
                  {hasDescription(x) && <p>{x.description}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {languages.length > 0 && (
        <section className="pfSection">
          <h2 className="pfSectionTitle">{lang === 'en' ? 'Languages' : 'Lingue'}</h2>
          <div className="pfSkillTags">
            {languages.map(x => (
              <span className="tagPill" key={x.id}>{x.lingua}{fieldVisible(x, 'livello') ? ` · ${levelLabels[x.livello]?.[lang] || x.livello}` : ''}</span>
            ))}
          </div>
        </section>
      )}

      {awards.length > 0 && (
        <section className="pfSection">
          <h2 className="pfSectionTitle">{lang === 'en' ? 'Awards' : 'Premi e riconoscimenti'}</h2>
          <div className="pfTimeline">
            {awards.map(x => (
              <article className="pfTimelineItem" key={x.id}>
                <span className="pfTimelineDate">{formatDateRange(x.date, null, lang)}</span>
                <div>
                  <h3>{[fieldVisible(x, 'title') ? x.title : '', fieldVisible(x, 'issuer') ? x.issuer : ''].filter(Boolean).join(' · ')}</h3>
                  {hasDescription(x) && <p>{x.description}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section className="pfSection pfReviewsSection">
          <h2 className="pfSectionTitle">{lang === 'en' ? 'Reviews' : 'Recensioni'}</h2>
          <div className="pfReviewGrid">
            {reviews.slice(0, 9).map(r => (
              <article className="pfReviewCard" key={r.id}>
                <div className="pfStars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                <p>{r.review_text}</p>
                <b>{r.reviewer_name}</b>
                {(r.reviewer_role || r.reviewer_company) && (
                  <span>{[r.reviewer_role, r.reviewer_company].filter(Boolean).join(' · ')}</span>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      <footer className="pfFooter">
        {qrCode && <img src={qrCode} alt="QR" className="pfFooterQr" />}
        <div>
          <strong>{full}</strong>
          {p.email_cv && <p>{p.email_cv}</p>}
          {publicUrl && <p className="muted">{publicUrl}</p>}
        </div>
      </footer>
    </div>
  );
}
