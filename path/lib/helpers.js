export const SKILL_CATEGORIES=['Leadership & Management','Operations','Project Management','Data & Analytics','Technology','Engineering','Finance & Business','Sales & Marketing','Communication','Supply Chain','Quality & Improvement','Industry Expertise'];
export const CATEGORY_LABELS={'Leadership & Management':{it:'Leadership e management',en:'Leadership & Management'},Operations:{it:'Operations',en:'Operations'},'Project Management':{it:'Project management',en:'Project Management'},'Data & Analytics':{it:'Dati e analytics',en:'Data & Analytics'},Technology:{it:'Tecnologia',en:'Technology'},Engineering:{it:'Ingegneria',en:'Engineering'},'Finance & Business':{it:'Finanza e business',en:'Finance & Business'},'Sales & Marketing':{it:'Vendite e marketing',en:'Sales & Marketing'},Communication:{it:'Comunicazione',en:'Communication'},'Supply Chain':{it:'Supply chain',en:'Supply Chain'},'Quality & Improvement':{it:'Qualità e miglioramento',en:'Quality & Improvement'},'Industry Expertise':{it:'Competenze di settore',en:'Industry Expertise'}};
export function categoryLabel(category,lang='it'){return CATEGORY_LABELS[category]?.[lang]||category}
const RADAR_SHORT_LABELS={'Leadership & Management':{it:'Leadership',en:'Leadership'},Operations:{it:'Operations',en:'Operations'},'Project Management':{it:'Project Mgmt',en:'Project Mgmt'},'Data & Analytics':{it:'Dati',en:'Data'},Technology:{it:'Tecnologia',en:'Technology'},Engineering:{it:'Ingegneria',en:'Engineering'},'Finance & Business':{it:'Finanza',en:'Finance'},'Sales & Marketing':{it:'Sales & Mktg',en:'Sales & Mktg'},Communication:{it:'Comunicazione',en:'Communication'},'Supply Chain':{it:'Supply Chain',en:'Supply Chain'},'Quality & Improvement':{it:'Qualità',en:'Quality'},'Industry Expertise':{it:'Settore',en:'Industry'}};
export function radarLabel(category,lang='it'){return RADAR_SHORT_LABELS[category]?.[lang]||categoryLabel(category,lang)}
export function getYouTubeEmbedUrl(url){if(!url)return'';try{const u=new URL(String(url).trim());let id='';if(u.hostname.includes('youtu.be')){id=u.pathname.replace('/','')}else if(u.hostname.includes('youtube.com')){if(u.pathname.startsWith('/shorts/'))id=u.pathname.split('/shorts/')[1];else if(u.pathname.startsWith('/embed/'))id=u.pathname.split('/embed/')[1];else id=u.searchParams.get('v')||''}id=(id||'').split('&')[0].split('?')[0];if(!id)return'';return `https://www.youtube.com/embed/${id}`}catch{return''}}
export const COURSE_LIBRARY={'Leadership & Management':['Leadership fundamentals','People management','Coaching and mentoring','Gestione dei conflitti','Delega efficace','Leadership situazionale'],Operations:['Operations management','Production planning','Process design','Gestione della capacità produttiva','Efficienza operativa','KPI e cruscotti operativi'],'Project Management':['Project management fundamentals','Agile and Scrum','Risk management','Certificazione PMP','Gestione stakeholder','Gantt e pianificazione avanzata'],'Data & Analytics':['Advanced Excel dashboards','Power BI fundamentals','Data analysis and statistics','SQL per l\'analisi dati','Data storytelling','Introduzione al machine learning'],Technology:['SQL fundamentals','Python for professionals','ERP and digital tools','Cloud computing basics','Cybersecurity essentials','Automazione dei processi (no-code)'],Engineering:['Industrial engineering basics','CAD/CAM fundamentals','Technical problem solving','Manutenzione predittiva','Automazione industriale','Normative di sicurezza tecnica'],'Finance & Business':['Business analysis','Budgeting and controlling','Business model fundamentals','Lettura del bilancio','Analisi degli investimenti','Pricing strategy'],'Sales & Marketing':['Digital marketing fundamentals','Sales strategy','Personal branding','Google Ads e SEO','Social media marketing','Tecniche di negoziazione'],Communication:['Public speaking','Professional writing','Stakeholder communication','Comunicazione persuasiva','Public relations','Gestione della comunicazione di crisi'],'Supply Chain':['Supply chain management','Inventory and MRP','Logistics fundamentals','Procurement strategico','Gestione fornitori','Ottimizzazione della catena distributiva'],'Quality & Improvement':['Lean Six Sigma fundamentals','Root cause analysis','Continuous improvement','Certificazione ISO 9001','Kaizen sul campo','Problem solving strutturato (8D, 5 Why)'],'Industry Expertise':['Sector-specific certification','Portfolio project','Professional specialization','Networking di settore','Case study reali del proprio ambito','Mentorship con un senior del settore']};
export const levelLabels={native:{it:'Madrelingua',en:'Native'},c2:{it:'C2',en:'C2'},c1:{it:'C1',en:'C1'},b2:{it:'B2',en:'B2'},b1:{it:'B1',en:'B1'},a2:{it:'A2',en:'A2'},a1:{it:'A1',en:'A1'},basic:{it:'Base',en:'Basic'}};
export function getSiteUrl(){const env=(process.env.NEXT_PUBLIC_SITE_URL||'').replace(/\/$/,'');if(env&&!env.includes('localhost')&&!env.includes('127.0.0.1'))return env;if(typeof window!=='undefined'&&window.location?.origin)return window.location.origin;return env||'http://localhost:3000'}
export function makePublicUrl(slug,lang){return slug?`${getSiteUrl()}/qrcv/${slug}${lang==='en'?'?lang=en':''}`:''}
export function makeQrUrl(slug){return slug?`${getSiteUrl()}/qrcv/${slug}?qr=1`:''}
export function slugify(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}
export function makePublicSlug({nome='',cognome='',email=''}={}){const base=slugify([nome,cognome].filter(Boolean).join('-'))||slugify((email||'').split('@')[0])||'profilo';return `${base}-${Math.random().toString(16).slice(2,8)}`}
export function formatMonthYear(date,lang='it'){if(!date)return'';const d=new Date(`${date}T00:00:00`);if(Number.isNaN(d.getTime()))return'';return d.toLocaleDateString(lang==='en'?'en-US':'it-IT',{month:'2-digit',year:'numeric'})}
export function formatDateRange(start,end,lang='it'){const s=formatMonthYear(start,lang);const e=end?formatMonthYear(end,lang):(s?(lang==='en'?'Present':'Presente'):'');if(s&&e)return `${s} - ${e}`;return s||e||''}
export function cleanDateFields(payload,fields){const next={...payload};fields.forEach(f=>{if(next[f]==='')next[f]=null});return next}
export function restoreScrollAfter(fn){const y=typeof window!=='undefined'?window.scrollY:0;return Promise.resolve(fn()).finally(()=>{if(typeof window!=='undefined')requestAnimationFrame(()=>window.scrollTo({top:y,behavior:'instant'}))})}
export function normalizeCategory(cat){const map={'Digital':'Technology','Digital & Data':'Data & Analytics','Digital, AI & Automazione':'Technology','Data Analysis & Reporting':'Data & Analytics','Gestione Progetti':'Project Management','Project & Process Management':'Project Management','Comunicazione':'Communication','Comunicazione & Public Speaking':'Communication','Communication & Collaboration':'Communication','Leadership':'Leadership & Management','Leadership & People Management':'Leadership & Management','Tecniche di Settore':'Industry Expertise','Fashion, Product & Manufacturing':'Industry Expertise','Finance, Legal & Business':'Finance & Business','Analisi & Problem Solving':'Quality & Improvement','Problem Solving & Continuous Improvement':'Quality & Improvement','Creativita & Design':'Industry Expertise','Creatività & Design':'Industry Expertise','Creatività, Design & UX':'Industry Expertise','Altro':'Industry Expertise','Altro / Settoriale':'Industry Expertise','Operations & Process Improvement':'Operations','Quality Management':'Quality & Improvement','Supply Chain & Logistics':'Supply Chain','Information Technology':'Technology','Engineering & Technical':'Engineering','Sales, Marketing & Personal Branding':'Sales & Marketing','Education & Training':'Leadership & Management','Research & Innovation':'Industry Expertise','Languages':'Communication'};return SKILL_CATEGORIES.includes(cat)?cat:(map[cat]||'Industry Expertise')}
export function skillExperienceYears(acquiredDate){if(!acquiredDate)return null;const start=new Date(`${acquiredDate}T00:00:00`);if(Number.isNaN(start.getTime()))return null;const now=new Date();let years=(now-start)/(365.25*24*60*60*1000);if(years<0)years=0;return Math.round(years*10)/10}
export function skillExperienceLabel(acquiredDate,lang='it'){const y=skillExperienceYears(acquiredDate);if(y===null)return'';if(y<0.1)return lang==='en'?'less than 1 year':'meno di 1 anno';const rounded=Number.isInteger(y)?String(Math.round(y)):String(y).replace('.',',');return lang==='en'?`${String(y).replace(',','.')} yrs`:`${rounded} anni`}
export function isVisibleInLang(row,lang){return !row?.content_lang||row.content_lang==='all'||row.content_lang===lang}
export function fieldVisible(row,field){if(row?.is_hidden)return false;const v=row?.cv_visibility||{};if(Object.prototype.hasOwnProperty.call(v,field))return Boolean(v[field]);return true}
export function suggestSkillsForCategory(category){const map={'Leadership & Management':['People management','Team leadership','Coaching','Gestione dei conflitti','Delega','Feedback efficace'],Operations:['Production planning','Process design','Capacity planning','Efficienza operativa','Gestione turni','Analisi KPI'],'Project Management':['Agile planning','Risk management','Roadmap management','Scrum','Gestione stakeholder','Pianificazione Gantt'],'Data & Analytics':['Power BI','Advanced Excel','Statistics','SQL','Data visualization','Data storytelling'],Technology:['SQL','Python','ERP systems','Cloud computing','Cybersecurity','Automazione processi'],Engineering:['CAD/CAM','Industrial engineering','Technical problem solving','Manutenzione predittiva','Automazione industriale','Normative tecniche'],'Finance & Business':['Budgeting','Costing','Business analysis','Lettura di bilancio','Analisi investimenti','Pricing'],'Sales & Marketing':['Digital marketing','Sales strategy','Personal branding','SEO/SEM','Social media marketing','Negoziazione'],Communication:['Public speaking','Presentation skills','Stakeholder management','Scrittura professionale','Public relations','Comunicazione di crisi'],'Supply Chain':['MRP','Inventory management','Logistics','Procurement','Gestione fornitori','Ottimizzazione distribuzione'],'Quality & Improvement':['Lean Six Sigma','Kaizen','Root cause analysis','ISO 9001','Problem solving strutturato','Audit di qualità'],'Industry Expertise':['Sector specialization','Domain knowledge','Portfolio project','Networking di settore','Case study reali','Mentorship di settore']};return map[category]||map['Industry Expertise']}
export function computeSkillInsights(skills){const visible=(skills||[]).filter(s=>!s.is_hidden);const byCat=new Map(SKILL_CATEGORIES.map(c=>[c,[]]));visible.forEach(s=>{const cat=normalizeCategory(s.category);byCat.get(cat).push(Number(s.rating||0))});const radar=SKILL_CATEGORIES.map(category=>{const values=byCat.get(category)||[];const avg=values.length?values.reduce((a,b)=>a+b,0)/values.length:0;return{category,count:values.length,avg:Number(avg.toFixed(2))}});const coverage=radar.filter(r=>r.count>0).length/SKILL_CATEGORIES.length;const avg=visible.length?visible.reduce((a,s)=>a+Number(s.rating||0),0)/visible.length:0;const score=Math.max(0,Math.min(100,Math.round((avg/5)*82+coverage*18)));const suggestions=radar.map(r=>{const priority=r.count===0?0:r.avg<3.5?1:2;const reason=r.count===0?'Categoria non ancora coperta nel profilo.':r.avg<3.5?`Media ${r.avg}/5: area da rafforzare.`:`Media ${r.avg}/5: buona base, puoi specializzarti ulteriormente.`;return{category:r.category,priority,reason,skills:suggestSkillsForCategory(r.category),courses:COURSE_LIBRARY[r.category]||COURSE_LIBRARY['Industry Expertise']}}).sort((a,b)=>a.priority-b.priority);return{radar,score,suggestions,avg:Number(avg.toFixed(2)),coverage:Number((coverage*100).toFixed(0))}}
// Metodo di calcolo del Worker Score (Professional Index)
// Il punteggio (0-100) è la somma trasparente di 6 componenti pesate,
// ognuna con un tetto massimo di punti. Non ci sono trasformazioni
// "magiche" (sigmoidi, curve arbitrarie): ogni punto guadagnato riflette
// direttamente qualcosa di verificabile nel profilo.
//   1. Qualità delle competenze   (max 25 pt) - media delle valutazioni skill (1-5)
//   2. Copertura delle competenze (max 10 pt) - quante aree su 12 sono coperte
//   3. Esperienza professionale   (max 20 pt) - anni cumulati di lavoro (max 10 anni)
//   4. Formazione e riconoscimenti(max 10 pt) - titoli di studio + premi
//   5. Portfolio concreto         (max 10 pt) - progetti + case study pubblicati
//   6. Completezza profilo        (max 15 pt) - campi anagrafici/CV compilati
//   7. Reputazione                (max 10 pt) - media e numero recensioni approvate
function monthsBetween(start,end){if(!start)return 0;const s=new Date(`${start}T00:00:00`);if(Number.isNaN(s.getTime()))return 0;const e=end?new Date(`${end}T00:00:00`):new Date();if(Number.isNaN(e.getTime()))return 0;const months=(e.getFullYear()-s.getFullYear())*12+(e.getMonth()-s.getMonth());return Math.max(0,months)}
export function computeWorkerScore({personal_info={},skills=[],work_experiences=[],educations=[],projects=[],case_studies=[],languages=[],awards=[],portfolio_reviews=[]}={}){
  const skill=computeSkillInsights(skills);
  const visibleWork=(work_experiences||[]).filter(x=>!x.is_hidden);
  const visibleEdu=(educations||[]).filter(x=>!x.is_hidden);
  const visibleAwards=(awards||[]).filter(x=>!x.is_hidden);
  const visibleProjects=[...(projects||[]),...(case_studies||[])].filter(x=>!x.is_hidden);
  const reviews=(portfolio_reviews||[]).filter(r=>r.status==='approved'&&r.consent_publication);

  // 1) Qualità competenze: media rating (0-5) -> 0-25 pt
  const skillQuality=Math.min(25,(skill.avg/5)*25);
  // 2) Copertura competenze: quota di categorie coperte -> 0-10 pt
  const skillCoverage=Math.min(10,(skill.coverage/100)*10);
  // 3) Esperienza professionale: mesi totali cumulati (cap 10 anni = 120 mesi) -> 0-20 pt
  const totalMonths=visibleWork.reduce((sum,x)=>sum+monthsBetween(x.start_date,x.end_date),0);
  const experienceYears=Math.round((totalMonths/12)*10)/10;
  const experiencePart=Math.min(20,(totalMonths/120)*20);
  // 4) Formazione e riconoscimenti: ogni titolo vale 3pt, ogni premio 2pt -> 0-10 pt
  const educationPart=Math.min(10,visibleEdu.length*3+visibleAwards.length*2);
  // 5) Portfolio concreto: ogni progetto/case study vale 2.5pt -> 0-10 pt
  const portfolioPart=Math.min(10,visibleProjects.length*2.5);
  // 6) Completezza profilo: campi anagrafici principali compilati -> 0-15 pt
  const profileFields=['nome','cognome','job_title','summary','email_cv','telefono','citta_residenza','photo_url'];
  const completenessRatio=profileFields.filter(f=>String(personal_info?.[f]||'').trim()).length/profileFields.length;
  const completenessPart=completenessRatio*15;
  // 7) Reputazione: media recensioni (1-5) pesata sulla numerosità (fino a 3 recensioni = confidenza piena) -> 0-10 pt
  const avgReview=reviews.length?reviews.reduce((a,r)=>a+Number(r.rating||0),0)/reviews.length:0;
  const reviewConfidence=Math.min(1,reviews.length/3);
  const reputationPart=(avgReview/5)*10*reviewConfidence;

  const rawTotal=skillQuality+skillCoverage+experiencePart+educationPart+portfolioPart+completenessPart+reputationPart;
  const score=Math.max(0,Math.min(100,Math.round(rawTotal)));

  let label='Profilo Iniziale';
  if(score>=85)label='Elite Profile';else if(score>=70)label='Top Performer';else if(score>=55)label='Professionista Avanzato';else if(score>=35)label='Professionista';else if(score>=15)label='Profilo Base';

  return{score,label,details:{
    skillQuality:Math.round(skillQuality*10)/10,
    skillCoverage:Math.round(skillCoverage*10)/10,
    experiencePart:Math.round(experiencePart*10)/10,
    experienceYears,
    educationPart:Math.round(educationPart*10)/10,
    portfolioPart:Math.round(portfolioPart*10)/10,
    completenessPart:Math.round(completenessPart*10)/10,
    reputationPart:Math.round(reputationPart*10)/10,
    skillScore:skill.score,
    profileCompleteness:Math.round(completenessRatio*100),
    coverage:skill.coverage
  }}
}
// ===== Job Match: lista estesa di competenze/parole chiave =====
// Copre molte più aree rispetto alla lista iniziale (~20 termini): IT/dati,
// marketing, vendite, finanza, HR, legale, produzione, logistica, sanità,
// design, project management, lingue, soft skill, certificazioni, tool.
// Sono frasi complete (non singole parole), confrontate come sottostringa
// nel testo dell'annuncio già normalizzato (minuscolo, senza accenti).
// Parole chiave raggruppate per area di competenza (stessa tassonomia usata
// dal radar skill). Servono a due cose: 1) riconoscere le competenze in un
// annuncio di lavoro, 2) capire A QUALE AREA appartiene una parola chiave
// mancante, cosi da poter suggerire corsi mirati (e in futuro assegnare
// quello spazio a uno sponsor reale per quella specifica area).
export const KEYWORDS_BY_CATEGORY = {
  'Data & Analytics': ['excel','power point','powerpoint','word','outlook','google sheets','google docs','notion','airtable','power bi','power query','vba','macro','sql','python','r studio','sas','spss','data analysis','data analyst','data scientist','data science','machine learning','deep learning','big data','tableau','looker','qlik','etl','data warehouse','statistics','statistica','business intelligence','analytics','forecasting','modeling','modellazione'],
  Technology: ['javascript','typescript','java','c++','c#','php','html','css','react','angular','vue','node','django','flask','aws','azure','google cloud','docker','kubernetes','git','github','devops','ci/cd','api','rest','graphql','database','database administration','cybersecurity','sicurezza informatica','cloud computing','linux','windows server','erp','sap','crm','salesforce','hubspot','zendesk','jira','confluence','agile','scrum','kanban'],
  'Sales & Marketing': ['digital marketing','social media','seo','sem','google ads','facebook ads','content marketing','email marketing','copywriting','brand management','branding','marketing strategy','growth marketing','influencer marketing','google analytics','crm marketing','sales','vendite','business development','account management','key account','negoziazione','negotiation','customer relationship','lead generation','sales strategy','trade marketing','retail','e-commerce','pricing'],
  'Finance & Business': ['finance','finanza','accounting','contabilita','bilancio','budgeting','budget','controllo di gestione','financial analysis','financial planning','tax','fiscale','audit','revisione contabile','investment','investimenti','risk management','treasury','tesoreria','cost analysis','fatturazione','payroll'],
  'Leadership & Management': ['human resources','risorse umane','recruiting','recruitment','talent acquisition','selezione del personale','training','formazione','onboarding','performance management','compensation','organizational development','employer branding','diversity','inclusion','people management','leadership','team management','gestione del team','autonomia','lavoro di squadra','teamwork','proattivita','orientamento al risultato'],
  'Industry Expertise': ['legal','diritto','compliance','gdpr','privacy','contratti','contract management','normativa','regulatory','due diligence','proprieta intellettuale','intellectual property','graphic design','ui design','ux design','ui/ux','figma','adobe photoshop','adobe illustrator','adobe premiere','video editing','fotografia','3d modeling','product design','healthcare','sanita','clinical research','farmaceutico','pharma','biotech','laboratorio','laboratory','nursing','infermieristica','teaching','insegnamento','docenza','curriculum development','e-learning','coaching','mentoring','hospitality','ristorazione','food and beverage','customer service','servizio clienti','store management','visual merchandising','turismo','tourism','hotel management'],
  Engineering: ['manufacturing','produzione','engineering','ingegneria','meccanica','elettronica','automazione','automation','plc','cad','autocad','solidworks','manutenzione','maintenance','safety','sicurezza sul lavoro','haccp'],
  'Quality & Improvement': ['lean','lean six sigma','six sigma','kaizen','quality control','quality assurance','iso 9001','process improvement','miglioramento continuo'],
  'Supply Chain': ['supply chain','logistics','logistica','procurement','approvvigionamento','inventory management','warehouse','magazzino','demand planning','production planning','import export','spedizioni','shipping'],
  'Project Management': ['project management','program management','pmp','prince2','gantt','stakeholder management','risk assessment','change management','planning','pianificazione'],
  Communication: ['pr','public relations','comunicazione','ufficio stampa','inglese','english','francese','french','tedesco','german','spagnolo','spanish','cinese','mandarin','portoghese','portuguese','comunicazione efficace','public speaking','presentation skills','multitasking'],
  Operations: ['problem solving','pensiero critico','critical thinking','creativita','adattabilita','flessibilita','time management','gestione del tempo']
};
export const COMMON_KEYWORDS = Object.values(KEYWORDS_BY_CATEGORY).flat();
export function categoryForKeyword(keyword) {
  const k = String(keyword || '');
  for (const [cat, list] of Object.entries(KEYWORDS_BY_CATEGORY)) {
    if (list.includes(k)) return cat;
  }
  return 'Industry Expertise';
}
// Versione "tollerante": usata per classificare testo libero (es. risposte
// dell'AI) che potrebbe non coincidere esattamente con una voce della lista.
export function categoryForText(text) {
  const norm = String(text || '').toLowerCase();
  if (!norm) return 'Industry Expertise';
  for (const [cat, list] of Object.entries(KEYWORDS_BY_CATEGORY)) {
    if (list.some(k => norm.includes(k) || k.includes(norm))) return cat;
  }
  return 'Industry Expertise';
}

function normalizeText(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Confronto testuale (senza AI): trova quali parole chiave RILEVANTI PER
// QUESTO ANNUNCIO sono coperte dalle skill dell'utente. Il punteggio non
// dipende dalla dimensione della lista globale, ma solo da quante delle
// parole chiave effettivamente presenti nell'annuncio sono coperte.
export function matchKeywords(jobText, skillNames = [], extraKeywords = []) {
  const text = normalizeText(jobText);
  const skills = (skillNames || []).map(s => ({ raw: s, norm: normalizeText(s) }));

  const matchedSkills = skills.filter(s => s.norm && (text.includes(s.norm) || s.norm.split(/\s+/).some(tok => tok.length > 2 && text.includes(tok)))).map(s => s.raw);

  const pool = extraKeywords && extraKeywords.length ? Array.from(new Set([...COMMON_KEYWORDS, ...extraKeywords])) : COMMON_KEYWORDS;
  const relevantKeywords = pool.filter(k => k && text.includes(k));
  const skillsText = skills.map(s => s.norm).join(' | ');
  const coveredKeywords = relevantKeywords.filter(k => skillsText.includes(k));
  const missingKeywords = relevantKeywords.filter(k => !coveredKeywords.includes(k));

  const skillRatio = matchedSkills.length / Math.max(1, Math.min(10, skills.length || 1));
  const keywordCoverage = relevantKeywords.length ? coveredKeywords.length / relevantKeywords.length : 1;
  const score = Math.max(0, Math.min(100, Math.round(skillRatio * 70 + keywordCoverage * 30)));

  return { score, matched: matchedSkills, missing: missingKeywords, missingCategories: dedupeCategories(missingKeywords.map(categoryForKeyword)) };
}
function dedupeCategories(list) {
  const seen = new Set();
  const out = [];
  list.forEach(c => { if (!seen.has(c)) { seen.add(c); out.push(c); } });
  return out;
}
