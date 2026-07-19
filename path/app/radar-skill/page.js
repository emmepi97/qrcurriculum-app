'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import {
  SKILL_CATEGORIES,
  categoryLabel,
  radarLabel,
  computeSkillInsights,
  computeWorkerScore,
  normalizeCategory,
  skillExperienceLabel
} from '@/lib/helpers';
import { useLang } from '@/components/LanguageProvider';
import AppTopbar from '@/components/AppTopbar';
import { exportElementPdf } from '@/lib/exportCvPdf';

const RADAR_SIZE = 420;
const RADAR_R = 148;

function axisPoint(i, total, size = RADAR_SIZE, r = RADAR_R) {
  const a = (-90 + i * (360 / total)) * Math.PI / 180;
  return [size / 2 + r * Math.cos(a), size / 2 + r * Math.sin(a)];
}
function polygon(values, size = RADAR_SIZE) {
  const cx = size / 2, cy = size / 2, maxR = RADAR_R;
  return values.map((v, i) => {
    const a = (-90 + i * (360 / values.length)) * Math.PI / 180;
    const r = maxR * (v / 5);
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(' ');
}
function wrapLabel(label) {
  const words = label.split(' ');
  if (words.length <= 1 || label.length <= 12) return [label];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

const EMPTY_EXTRA = { work_experiences: [], educations: [], projects: [], case_studies: [], languages: [], awards: [], portfolio_reviews: [] };

export default function RadarSkillPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState([]);
  const [profile, setProfile] = useState(null);
  const [extra, setExtra] = useState(EMPTY_EXTRA);
  const [error, setError] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push('/login?next=/radar-skill'); return; }
      setSession(data.session);
    });
  }, [router]);

  useEffect(() => { if (session?.user?.id) load(); }, [session?.user?.id]);

  async function load() {
    try {
      setLoading(true);
      const uid = session.user.id;
      const [{ data: s, error: e }, { data: p }] = await Promise.all([
        supabase.from('skills').select('*').eq('user_id', uid).eq('is_hidden', false).order('name', { ascending: true }),
        supabase.from('personal_info').select('*').eq('user_id', uid).maybeSingle()
      ]);
      if (e) throw e;
      setSkills(s || []);
      setProfile(p);
      const tables = ['work_experiences', 'educations', 'projects', 'case_studies', 'languages', 'awards'];
      const pairs = await Promise.all(tables.map(async tab => {
        const { data } = await supabase.from(tab).select('*').eq('user_id', uid).eq('is_hidden', false).limit(100);
        return [tab, data || []];
      }));
      const { data: reviews } = await supabase.from('portfolio_reviews').select('*').eq('owner_user_id', uid).eq('status', 'approved').eq('consent_publication', true).limit(100);
      setExtra({ ...Object.fromEntries(pairs), portfolio_reviews: reviews || [] });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const insights = useMemo(() => computeSkillInsights(skills), [skills]);
  const worker = useMemo(() => computeWorkerScore({ personal_info: profile, skills, ...extra }), [profile, skills, extra]);
  const vals = insights.radar.map(x => x.avg);

  if (loading) return <p className="pageWrap">{t.loading}</p>;

  const breakdownRows = [
    { label: lang === 'en' ? 'Skill quality' : 'Qualità competenze', value: worker.details.skillQuality, max: 25 },
    { label: lang === 'en' ? 'Skill coverage' : 'Copertura competenze', value: worker.details.skillCoverage, max: 10 },
    { label: lang === 'en' ? 'Professional experience' : 'Esperienza professionale', value: worker.details.experiencePart, max: 20 },
    { label: lang === 'en' ? 'Education & awards' : 'Formazione e riconoscimenti', value: worker.details.educationPart, max: 10 },
    { label: lang === 'en' ? 'Portfolio (projects)' : 'Portfolio (progetti)', value: worker.details.portfolioPart, max: 10 },
    { label: lang === 'en' ? 'Profile completeness' : 'Completezza profilo', value: worker.details.completenessPart, max: 15 },
    { label: lang === 'en' ? 'Reputation (reviews)' : 'Reputazione (recensioni)', value: worker.details.reputationPart, max: 10 }
  ];

  return (
    <>
      <AppTopbar email={session?.user?.email} />
      <section className="heroPanel">
        <div className="cleanHero">
          <div className="eyebrow">{t.radarSkill}</div>
          <h1>{t.radarTitle}</h1>
          <p>{t.radarDesc}</p>
        </div>
        <button className="btn light" onClick={() => exportElementPdf(reportRef.current, `Radar-Skill-${profile?.nome || 'profilo'}.pdf`)}>
          {lang === 'en' ? 'Download PDF report' : 'Scarica report PDF'}
        </button>
      </section>

      {error && <p className="pageWrap error">{error}</p>}

      <main className="radarPageLayout" ref={reportRef}>
        <div className="radarIdentity">
          <h2>{profile?.nome} {profile?.cognome}</h2>
          <p className="muted">{profile?.job_title} · {profile?.email_cv}</p>
        </div>

        <div className="radarTop">
          <div className="radarChartCard">
            <h3>{t.radarTitle}</h3>
            <div className="radarSvgWrap">
              <svg viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`} className="radarSvg">
                {[1, 2, 3, 4, 5].map(l => (
                  <polygon key={l} className="radarGrid" points={SKILL_CATEGORIES.map((_, i) => axisPoint(i, SKILL_CATEGORIES.length, RADAR_SIZE, RADAR_R * l / 5).join(',')).join(' ')} />
                ))}
                {SKILL_CATEGORIES.map((c, i) => {
                  const [x, y] = axisPoint(i, SKILL_CATEGORIES.length);
                  const lines = wrapLabel(radarLabel(c, lang));
                  const anchor = x > RADAR_SIZE / 2 + 10 ? 'start' : x < RADAR_SIZE / 2 - 10 ? 'end' : 'middle';
                  return (
                    <g key={c}>
                      <line className="radarAxis" x1={RADAR_SIZE / 2} y1={RADAR_SIZE / 2} x2={x} y2={y} />
                      <text className="radarLabel" x={x} y={y} textAnchor={anchor}>
                        {lines.map((line, li) => (
                          <tspan key={li} x={x} dy={li === 0 ? (lines.length > 1 ? -4 : 4) : 12}>{line}</tspan>
                        ))}
                      </text>
                    </g>
                  );
                })}
                <polygon className="radarArea" points={polygon(vals)} />
                {vals.map((v, i) => {
                  const [x, y] = axisPoint(i, SKILL_CATEGORIES.length, RADAR_SIZE, RADAR_R * v / 5);
                  return <circle key={i} className="radarDot" cx={x} cy={y} r="4" />;
                })}
              </svg>
            </div>
            <p className="radarLegendNote muted">
              {lang === 'en'
                ? 'Each axis is a competency area. The further from the center, the higher your average self-rating (1-5) in that area.'
                : 'Ogni asse rappresenta un\'area di competenza. Più il punto è lontano dal centro, più alta è la valutazione media (1-5) in quell\'area.'}
            </p>
          </div>

          <aside className="scoreCard">
            <h3>{t.professionalIndex}</h3>
            <div className="scoreCircle" style={{ '--score': `${worker.score}%` }}><strong>{worker.score}</strong></div>
            <p className="scoreLabel"><b>{worker.label}</b></p>
            <button type="button" className="linkButton scoreBreakdownToggle" onClick={() => setShowBreakdown(v => !v)}>
              {showBreakdown ? (lang === 'en' ? 'Hide details' : 'Nascondi dettaglio') : t.scoreBreakdown}
            </button>
            {showBreakdown && (
              <div className="scoreBreakdownList">
                {breakdownRows.map(row => (
                  <div key={row.label} className="scoreBreakdownRow">
                    <span>{row.label}</span>
                    <div className="scoreBreakdownBar"><i style={{ width: `${Math.min(100, (row.value / row.max) * 100)}%` }} /></div>
                    <b>{row.value.toFixed(1)}/{row.max}</b>
                  </div>
                ))}
                {worker.details.experienceYears > 0 && (
                  <p className="muted scoreBreakdownFoot">
                    {worker.details.experienceYears} {t.experienceYears}
                  </p>
                )}
              </div>
            )}

            <h3 className="categoryDetailTitle">{lang === 'en' ? 'Category detail' : 'Dettaglio categorie'}</h3>
            <div className="categoryDetailList">
              {insights.radar.map(r => (
                <div key={r.category} className="categoryDetailRow">
                  <span>{categoryLabel(r.category, lang)}</span>
                  <b>{r.count ? `${r.avg.toFixed(1)}/5 · ${r.count}` : '—'}</b>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <section className="smartSection">
          <h3>{t.skillList}</h3>
          <div className="tagCloud">
            {skills.length === 0 ? (
              <p className="muted">{lang === 'en' ? 'No skill entered yet.' : 'Nessuna competenza inserita.'}</p>
            ) : skills.map(s => {
              const exp = skillExperienceLabel(s.acquired_date, lang);
              return (
                <span className="tagPill" key={s.id}>
                  {s.name} · {s.rating}/5 · {categoryLabel(normalizeCategory(s.category), lang)}{exp ? ` · ${exp}` : ''}
                </span>
              );
            })}
          </div>
        </section>

        <section className="smartSection">
          <h3>{t.suggestedCourses}</h3>
          <p className="hint">{t.suggestedCoursesHelp}</p>
          <div className="suggestionGrid">
            {insights.suggestions.length === 0 ? (
              <p className="muted">{lang === 'en' ? 'Your profile already covers every area well.' : 'Il tuo profilo copre già bene tutte le aree.'}</p>
            ) : insights.suggestions.map(s => (
              <article className={`suggestionCard suggestionPriority${s.priority}`} key={s.category}>
                <span className="suggestionBadge">
                  {s.priority === 0 ? (lang === 'en' ? 'Not covered' : 'Non coperta') : s.priority === 1 ? (lang === 'en' ? 'To strengthen' : 'Da rafforzare') : (lang === 'en' ? 'Good base' : 'Buona base')}
                </span>
                <h4>{categoryLabel(s.category, lang)}</h4>
                <p>{s.reason}</p>
                <b>{t.suggestedSkills}</b>
                <div className="tagCloud">{s.skills.map(x => <span className="tagPill" key={x}>{x}</span>)}</div>
                <b>{t.suggestedCourses}</b>
                <ul>{s.courses.map(x => <li key={x}>{x}</li>)}</ul>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
