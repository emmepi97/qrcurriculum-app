'use client';
import { forwardRef, memo, useImperativeHandle } from 'react';
import {
  fieldVisible,
  formatDateRange,
  formatMonthYear,
  isVisibleInLang,
  levelLabels,
  skillExperienceLabel,
} from '@/lib/helpers';
import { useLang } from '@/components/LanguageProvider';
import ImagePreview from '@/components/ImagePreview';
import useAutoFitA4 from '@/lib/useAutoFitA4';
import styles from './CvTemplate.module.css';

/* ------------------------------------------------------------------
   Helper di dati (stessa logica della versione precedente, isolata
   qui per tenere il componente principale leggibile).
------------------------------------------------------------------ */
function hasDescription(row, field = 'description') {
  return !row.hide_description && fieldVisible(row, field) && row[field];
}

function sortSkills(skills) {
  return [...(skills || [])].sort((a, b) =>
    String(a.name || '').localeCompare(String(b.name || ''), 'it', { sensitivity: 'base' })
  );
}

function visibleInCurrentLang(list, lang) {
  return (list || []).filter((x) => !x.is_hidden && isVisibleInLang(x, lang));
}

/* ------------------------------------------------------------------
   Sotto-componenti di presentazione: ognuno rende una sola sezione
   del CV, sempre con markup piatto/fluido (niente card, niente
   altezze fisse).
------------------------------------------------------------------ */
function CvHeader({ full, jobTitle, contactBits, photoUrl }) {
  return (
    <div className={styles.headerFlex}>
      <div className={styles.headerMain}>
        <h1 className={styles.name}>{full}</h1>
        {jobTitle && <p className={styles.headline}>{jobTitle}</p>}
        {contactBits.length > 0 && <p className={styles.contactLine}>{contactBits.join(' · ')}</p>}
      </div>
      {photoUrl && (
        <div className={styles.avatarBox}>
          <ImagePreview url={photoUrl} alt={full} />
        </div>
      )}
    </div>
  );
}

function CvSection({ title, children }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

function CvEntry({ title, meta, children }) {
  return (
    <div className={styles.item}>
      <div className={styles.itemHeader}>
        <h3 className={styles.itemTitle}>{title}</h3>
        {meta && <span className={styles.itemMeta}>{meta}</span>}
      </div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------
   Componente principale
------------------------------------------------------------------ */
function CvTemplateInner({ data, qrCode, forcedLang }, forwardedRef) {
  const ctx = useLang();
  const lang = forcedLang || ctx.lang;
  const t = ctx.t;

  const p = data?.personal_info || {};
  const full = [p.nome, p.cognome].filter(Boolean).join(' ') || (lang === 'en' ? 'Your name' : 'Il tuo nome');
  const contactBits = [p.citta_residenza, p.nazione, p.email_cv, p.telefono].filter(Boolean);

  const availability = data?.professional_availability;
  const reviews = data?.portfolio_reviews || [];
  const work = visibleInCurrentLang(data?.work_experiences, lang);
  const education = visibleInCurrentLang(data?.educations, lang);
  const languages = visibleInCurrentLang(data?.languages, lang);
  const skills = sortSkills(visibleInCurrentLang(data?.skills, lang));
  const awards = visibleInCurrentLang(data?.awards, lang);
  const projects = visibleInCurrentLang(data?.projects, lang);
  const caseStudies = visibleInCurrentLang(data?.case_studies, lang);

  const hasAvailability =
    availability &&
    (availability.open_to_work ||
      availability.consulting ||
      availability.freelance ||
      availability.networking ||
      availability.teaching ||
      availability.collaborations);

  // Il "watchKey" fa ri-misurare l'auto-fit ogni volta che cambia una
  // quantità di contenuto rilevante (nuove voci, lingua, ecc.).
  const watchKey = [
    lang,
    full,
    p.summary,
    work.length,
    education.length,
    languages.length,
    skills.length,
    awards.length,
    projects.length,
    caseStudies.length,
    reviews.length,
    Boolean(qrCode),
  ].join('|');

  const { sheetRef, contentRef } = useAutoFitA4(watchKey);

  // Espone il nodo DOM del foglio al genitore (per l'export PDF),
  // senza bisogno di id globali duplicabili nel documento.
  useImperativeHandle(forwardedRef, () => sheetRef.current, [sheetRef]);

  return (
    <div ref={sheetRef} className={styles.sheet}>
      <div ref={contentRef} className={styles.content}>
        <CvHeader full={full} jobTitle={p.job_title} contactBits={contactBits} photoUrl={p.photo_url} />

        {p.summary && (
          <CvSection title={lang === 'en' ? 'About me' : 'Chi sono'}>
            <p className={styles.text}>{p.summary}</p>
          </CvSection>
        )}

        {work.length > 0 && (
          <CvSection title={lang === 'en' ? 'Experience' : 'Esperienza'}>
            {work.map((x) => (
              <CvEntry
                key={x.id}
                title={`${x.role_title}${fieldVisible(x, 'company') && x.company ? ` - ${x.company}` : ''}`}
                meta={
                  (fieldVisible(x, 'start_date') || fieldVisible(x, 'end_date')) &&
                  formatDateRange(x.start_date, x.end_date, lang)
                }
              >
                {hasDescription(x) && <p className={styles.text}>{x.description}</p>}
              </CvEntry>
            ))}
          </CvSection>
        )}

        {education.length > 0 && (
          <CvSection title={lang === 'en' ? 'Education' : 'Formazione'}>
            {education.map((x) => {
              const subtitle = [
                fieldVisible(x, 'field_of_study') ? x.field_of_study : '',
                fieldVisible(x, 'location') ? x.location : '',
                fieldVisible(x, 'grade') && x.grade ? (lang === 'en' ? `Grade: ${x.grade}` : `Voto: ${x.grade}`) : '',
              ]
                .filter(Boolean)
                .join(' · ');
              return (
                <CvEntry
                  key={x.id}
                  title={`${x.title}${fieldVisible(x, 'institution') && x.institution ? ` - ${x.institution}` : ''}`}
                  meta={
                    (fieldVisible(x, 'start_date') || fieldVisible(x, 'end_date')) &&
                    formatDateRange(x.start_date, x.end_date, lang)
                  }
                >
                  {subtitle && <p className={styles.mutedSmall}>{subtitle}</p>}
                  {hasDescription(x) && <p className={styles.text}>{x.description}</p>}
                </CvEntry>
              );
            })}
          </CvSection>
        )}

        {languages.length > 0 && (
          <CvSection title={lang === 'en' ? 'Languages' : 'Lingue'}>
            <div className={styles.pillWrap}>
              {languages.map((x) => (
                <span className={styles.pill} key={x.id}>
                  {x.lingua}
                  {fieldVisible(x, 'livello') ? ` · ${levelLabels[x.livello]?.[lang] || x.livello}` : ''}
                </span>
              ))}
            </div>
          </CvSection>
        )}

        {skills.length > 0 && (
          <CvSection title={lang === 'en' ? 'Skills' : 'Competenze'}>
            <div className={styles.pillWrap}>
              {skills.map((x) => {
                const exp = skillExperienceLabel(x.acquired_date, lang);
                return (
                  <span className={styles.pill} key={x.id}>
                    {x.name}
                    {!x.hide_score && fieldVisible(x, 'rating') ? ` · ${x.rating}/5` : ''}
                    {exp ? ` · ${exp}` : ''}
                  </span>
                );
              })}
            </div>
          </CvSection>
        )}

        {awards.length > 0 && (
          <CvSection title={lang === 'en' ? 'Awards' : 'Premi e riconoscimenti'}>
            {awards.map((x) => (
              <CvEntry
                key={x.id}
                title={`${x.title}${fieldVisible(x, 'issuer') && x.issuer ? ` - ${x.issuer}` : ''}`}
                meta={fieldVisible(x, 'date') && formatMonthYear(x.date, lang)}
              >
                {hasDescription(x) && <p className={styles.text}>{x.description}</p>}
              </CvEntry>
            ))}
          </CvSection>
        )}

        {projects.length > 0 && (
          <CvSection title={lang === 'en' ? 'Projects' : 'Progetti'}>
            {projects.map((x) => (
              <CvEntry
                key={x.id}
                title={`${x.title}${fieldVisible(x, 'role') && x.role ? ` - ${x.role}` : ''}`}
                meta={
                  (fieldVisible(x, 'start_date') || fieldVisible(x, 'end_date')) &&
                  formatDateRange(x.start_date, x.end_date, lang)
                }
              >
                {hasDescription(x) && <p className={styles.text}>{x.description}</p>}
              </CvEntry>
            ))}
          </CvSection>
        )}

        {caseStudies.length > 0 && (
          <CvSection title="Case Study">
            {caseStudies.map((x) => (
              <CvEntry key={x.id} title={x.title} meta={fieldVisible(x, 'date') && formatMonthYear(x.date, lang)}>
                {!x.hide_description && (
                  <>
                    {fieldVisible(x, 'context') && x.context && (
                      <p className={styles.text}>
                        <b>{lang === 'en' ? 'Context' : 'Contesto'}:</b> {x.context}
                      </p>
                    )}
                    {fieldVisible(x, 'solution') && x.solution && (
                      <p className={styles.text}>
                        <b>{lang === 'en' ? 'Solution' : 'Soluzione'}:</b> {x.solution}
                      </p>
                    )}
                    {fieldVisible(x, 'impact') && x.impact && (
                      <p className={styles.text}>
                        <b>{lang === 'en' ? 'Impact' : 'Impatto'}:</b> {x.impact}
                      </p>
                    )}
                  </>
                )}
              </CvEntry>
            ))}
          </CvSection>
        )}

        {hasAvailability && (
          <CvSection title={lang === 'en' ? 'Available for' : 'Disponibile per'}>
            <p className={styles.text}>
              {[
                availability.open_to_work && (lang === 'en' ? 'New opportunities' : 'Nuove opportunità'),
                availability.consulting && (lang === 'en' ? 'Consulting' : 'Consulenze'),
                availability.freelance && 'Freelance',
                availability.networking && 'Networking',
                availability.teaching && (lang === 'en' ? 'Teaching/Training' : 'Docenze/Formazione'),
                availability.collaborations && (lang === 'en' ? 'Collaborations' : 'Collaborazioni'),
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
            {availability.contact_message && <p className={styles.text}>{availability.contact_message}</p>}
          </CvSection>
        )}

        {reviews.length > 0 && (
          <CvSection title={lang === 'en' ? 'References' : 'Referenze'}>
            {reviews.map((r) => (
              <div className={styles.item} key={r.id}>
                <h3 className={styles.itemTitle}>
                  <span className={styles.stars}>
                    {'★'.repeat(r.rating)}
                    {'☆'.repeat(5 - r.rating)}
                  </span>{' '}
                  · {r.reviewer_name}
                  {r.reviewer_company ? ` - ${r.reviewer_company}` : ''}
                </h3>
                {r.reviewer_role && (
                  <p className={styles.mutedSmall}>
                    {r.reviewer_role}
                    {r.relationship ? ` · ${r.relationship}` : ''}
                  </p>
                )}
                <p className={styles.text}>{r.review_text}</p>
              </div>
            ))}
          </CvSection>
        )}

        {qrCode && (
          <div className={styles.qrBlock}>
            <img src={qrCode} alt="QR portfolio" />
            <p className={styles.qrSmallText}>
              <b>{t.portfolioPhrase1}</b>
              <br />
              {t.portfolioPhrase2}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const CvTemplate = forwardRef(CvTemplateInner);
export default memo(CvTemplate);
