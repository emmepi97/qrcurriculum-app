export const SKILL_CATEGORIES = [
  'Digital, AI & Automazione',
  'Data Analysis & Reporting',
  'Project & Process Management',
  'Comunicazione & Public Speaking',
  'Leadership & People Management',
  'Sales, Marketing & Personal Branding',
  'Fashion, Product & Manufacturing',
  'Finance, Legal & Business',
  'Creatività, Design & UX',
  'Lingue & Interculturalità',
  'Problem Solving & Continuous Improvement',
  'Altro / Settoriale'
];

export const COURSE_LIBRARY = {
  'Digital, AI & Automazione': ['AI per il lavoro quotidiano', 'Automazione no-code con Zapier/Make', 'Prompt engineering pratico'],
  'Data Analysis & Reporting': ['Excel avanzato e dashboard', 'Power BI per principianti', 'SQL per analisi dati'],
  'Project & Process Management': ['Project management agile', 'Lean Six Sigma base', 'Gestione priorità e roadmap'],
  'Comunicazione & Public Speaking': ['Public speaking efficace', 'Scrittura professionale', 'Storytelling per presentazioni'],
  'Leadership & People Management': ['Leadership situazionale', 'Feedback e coaching', 'Gestione conflitti'],
  'Sales, Marketing & Personal Branding': ['LinkedIn personal branding', 'Fondamenti di marketing digitale', 'Tecniche di vendita consulenziale'],
  'Fashion, Product & Manufacturing': ['Industrializzazione prodotto moda', 'Supply chain fashion', 'Qualità e controllo processo'],
  'Finance, Legal & Business': ['Business model e pricing', 'Legal basics per freelance', 'Finance for non finance'],
  'Creatività, Design & UX': ['UX design fundamentals', 'Design thinking', 'Figma per prototipi'],
  'Lingue & Interculturalità': ['Business English', 'Comunicazione interculturale', 'English pronunciation'],
  'Problem Solving & Continuous Improvement': ['Problem solving strutturato', 'Root cause analysis', 'Kaizen e miglioramento continuo'],
  'Altro / Settoriale': ['Corso verticale di settore', 'Certificazione professionale mirata', 'Portfolio project guidato']
};

export const levelLabels = { native: 'Madrelingua', c2: 'C2', c1: 'C1', b2: 'B2', b1: 'B1', a2: 'A2', a1: 'A1', basic: 'Base' };

export function getSiteUrl() {
  const env = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  if (env && !env.includes('localhost') && !env.includes('127.0.0.1')) return env;
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  return env || 'http://localhost:3000';
}
export function makePublicUrl(slug) { return slug ? `${getSiteUrl()}/qrcv/${slug}` : ''; }
export function makeQrUrl(slug) { return slug ? `${getSiteUrl()}/qrcv/${slug}?qr=1` : ''; }
export function slugify(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
export function makePublicSlug({ nome, cognome, email }) {
  const base = slugify([nome, cognome].filter(Boolean).join('-')) || slugify((email || '').split('@')[0]) || 'profilo';
  return `${base}-${Math.random().toString(16).slice(2, 8)}`;
}
export function formatMonthYear(date, lang = 'it') {
  if (!date) return '';
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(lang === 'en' ? 'en-US' : 'it-IT', { month: '2-digit', year: 'numeric' });
}
export function formatDateRange(start, end, lang = 'it') {
  const s = formatMonthYear(start, lang);
  const e = end ? formatMonthYear(end, lang) : (s ? (lang === 'en' ? 'Present' : 'Presente') : '');
  if (s && e) return `${s} → ${e}`;
  return s || e || '';
}
export function cleanDateFields(payload, fields) {
  const next = { ...payload };
  fields.forEach(f => { if (next[f] === '') next[f] = null; });
  return next;
}
export function restoreScrollAfter(fn) {
  const y = typeof window !== 'undefined' ? window.scrollY : 0;
  return Promise.resolve(fn()).finally(() => {
    if (typeof window !== 'undefined') requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'instant' }));
  });
}
export function computeSkillInsights(skills) {
  const visible = (skills || []).filter(s => !s.is_hidden);
  const byCat = new Map();
  SKILL_CATEGORIES.forEach(c => byCat.set(c, []));
  visible.forEach(s => {
    const cat = SKILL_CATEGORIES.includes(s.category) ? s.category : 'Altro / Settoriale';
    byCat.get(cat).push(Number(s.rating || 0));
  });
  const radar = SKILL_CATEGORIES.map(category => {
    const values = byCat.get(category) || [];
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    return { category, count: values.length, avg: Number(avg.toFixed(2)) };
  });
  const coverage = radar.filter(r => r.count > 0).length / SKILL_CATEGORIES.length;
  const weightedAvg = visible.length ? visible.reduce((a, s) => a + Number(s.rating || 0), 0) / visible.length : 0;
  const balancePenalty = Math.max(0, 1 - coverage) * 10;
  const score = Math.max(0, Math.min(100, Math.round((weightedAvg / 5) * 82 + coverage * 18 - balancePenalty)));
  const weak = radar.filter(r => r.avg > 0 && r.avg < 3.5).sort((a, b) => a.avg - b.avg).slice(0, 3);
  const emptyStrategic = radar.filter(r => r.count === 0 && r.category !== 'Altro / Settoriale').slice(0, 3);
  const suggestions = [...weak, ...emptyStrategic].slice(0, 5).map(r => ({
    category: r.category,
    reason: r.count ? `Media ${r.avg}/5: area da rafforzare.` : 'Categoria non ancora coperta nel profilo.',
    skills: suggestSkillsForCategory(r.category),
    courses: COURSE_LIBRARY[r.category] || COURSE_LIBRARY['Altro / Settoriale']
  }));
  return { radar, score, suggestions };
}
function suggestSkillsForCategory(category) {
  const map = {
    'Digital, AI & Automazione': ['AI tools', 'No-code automation', 'Prompt engineering'],
    'Data Analysis & Reporting': ['Excel avanzato', 'Power BI', 'SQL'],
    'Project & Process Management': ['Agile planning', 'Lean Six Sigma', 'Roadmap management'],
    'Comunicazione & Public Speaking': ['Public speaking', 'Copywriting', 'Presentazioni efficaci'],
    'Leadership & People Management': ['Feedback', 'Coaching', 'Team management'],
    'Sales, Marketing & Personal Branding': ['LinkedIn strategy', 'Digital marketing', 'Sales pitch'],
    'Fashion, Product & Manufacturing': ['Industrializzazione', 'Qualità prodotto', 'Supply chain'],
    'Finance, Legal & Business': ['Pricing', 'Business model', 'Contrattualistica base'],
    'Creatività, Design & UX': ['UX research', 'Figma', 'Design thinking'],
    'Lingue & Interculturalità': ['Business English', 'Negoziazione internazionale', 'Comunicazione interculturale'],
    'Problem Solving & Continuous Improvement': ['Root cause analysis', 'Kaizen', 'Problem solving A3'],
    'Altro / Settoriale': ['Certificazione specialistica', 'Portfolio project', 'Tool verticale']
  };
  return map[category] || map['Altro / Settoriale'];
}
