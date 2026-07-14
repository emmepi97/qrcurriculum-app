'use client';
import { useEffect,useMemo,useRef,useState } from 'react';
import { useParams,useSearchParams } from 'next/navigation';
import QRCode from 'qrcode';
import supabase from '@/lib/supabaseClient';
import { makeQrUrl,formatDateRange,levelLabels,computeSkillInsights,computeWorkerScore,normalizeCategory } from '@/lib/helpers';
import CvTemplate from '@/components/cv/CvTemplate';
import { exportCvPdf } from '@/lib/exportCvPdf';
import { LanguageToggle,useLang } from '@/components/LanguageProvider';

const SIZE=420;
const CENTER=SIZE/2;
const GRID_R=118;
const LABEL_R=164;
function axisPoint(i,total,r=GRID_R){const a=(-90+i*(360/total))*Math.PI/180;return [CENTER+r*Math.cos(a),CENTER+r*Math.sin(a)]}
function radarPolygon(values){return values.map((v,i)=>{const[x,y]=axisPoint(i,values.length,GRID_R*(v/5));return `${x},${y}`}).join(' ')}
function shortLabel(text){return String(text||'').replace('Leadership & Management','Leadership').replace('Project Management','Project').replace('Data & Analytics','Data').replace('Quality & Improvement','Quality').replace('Industry Expertise','Industry')}
function anchor(x){return x<CENTER-20?'end':x>CENTER+20?'start':'middle'}
function videoEmbedUrl(url){
  const raw=String(url||'').trim();
  if(!raw)return '';
  try{
    const u=new URL(raw);
    const host=u.hostname.replace(/^www\./,'');
    if(host==='youtube.com'||host==='m.youtube.com'){
      const id=u.searchParams.get('v');
      if(id)return `https://www.youtube.com/embed/${id}`;
      if(u.pathname.startsWith('/shorts/'))return `https://www.youtube.com/embed/${u.pathname.split('/')[2]}`;
      if(u.pathname.startsWith('/embed/'))return raw;
    }
    if(host==='youtu.be'){
      const id=u.pathname.replace('/','');
      if(id)return `https://www.youtube.com/embed/${id}`;
    }
    if(host==='vimeo.com'){
      const id=u.pathname.split('/').filter(Boolean)[0];
      if(id)return `https://player.vimeo.com/video/${id}`;
    }
    if(host==='player.vimeo.com'||host==='www.youtube.com')return raw;
  }catch{}
  return '';
}
function Section({title,kicker,children,empty,className=''}){if(empty)return null;return <section className={`portfolioCard ${className}`.trim()}>{kicker&&<span className="portfolioSectionKicker">{kicker}</span>}<h2>{title}</h2>{children}</section>}
function Entry({title,meta,children}){return <article className="portfolioEntry"><div><h3>{title}</h3>{meta&&<p className="portfolioMeta">{meta}</p>}</div>{children&&<div className="portfolioText">{children}</div>}</article>}
function TimelineEntry({title,meta,children}){return <article className="portfolioTimelineItem"><div className="portfolioTimelineDot"/><div><h3>{title}</h3>{meta&&<p className="portfolioMeta">{meta}</p>}{children&&<div className="portfolioText">{children}</div>}</div></article>}

export default function PublicQrCvPage(){
  const {slug}=useParams();
  const params=useSearchParams();
  const {t,setLang,lang}=useLang();
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [data,setData]=useState(null);
  const [qrCode,setQrCode]=useState('');
  const tracked=useRef(false);
  const cvRef=useRef(null);

  useEffect(()=>{const urlLang=params.get('lang');if(urlLang==='en'||urlLang==='it')setLang(urlLang)},[params,setLang]);
  useEffect(()=>{async function load(){try{const{data:p,error:e}=await supabase.from('personal_info').select('*').eq('public_slug',slug).eq('is_public',true).maybeSingle();if(e||!p){setError(t.profileNotFound);setLoading(false);return}const next={personal_info:p};const tables=['work_experiences','educations','languages','skills','awards','projects','case_studies'];const results=await Promise.all(tables.map(async table=>{const{data:rows}=await supabase.from(table).select('*').eq('user_id',p.user_id).eq('is_hidden',false).order('created_at',{ascending:false});return[table,rows||[]]}));results.forEach(([table,rows])=>next[table]=rows);const{data:av}=await supabase.from('professional_availability').select('*').eq('user_id',p.user_id).maybeSingle();next.professional_availability=av;const{data:reviews}=await supabase.from('portfolio_reviews').select('*').eq('owner_user_id',p.user_id).eq('status','approved').eq('consent_publication',true).order('created_at',{ascending:false});next.portfolio_reviews=reviews||[];setData(next);QRCode.toDataURL(makeQrUrl(slug),{width:180,margin:1}).then(setQrCode);if(!tracked.current){tracked.current=true;const base={profile_user_id:p.user_id,public_slug:slug,path:typeof window!=='undefined'?window.location.pathname:'',referrer:typeof document!=='undefined'?document.referrer:'',user_agent:typeof navigator!=='undefined'?navigator.userAgent:''};await supabase.from('analytics_events').insert({...base,event_type:'profile_view'});if(params.get('qr')==='1')await supabase.from('analytics_events').insert({...base,event_type:'qr_scan'})}}catch(e){setError(e?.message||t.profileNotFound)}finally{setLoading(false)}}if(slug)load()},[slug,params,t.profileNotFound]);

  const insights=useMemo(()=>computeSkillInsights(data?.skills||[]),[data?.skills]);
  const worker=useMemo(()=>computeWorkerScore(data||{}),[data]);
  const p=data?.personal_info||{};
  const embed=videoEmbedUrl(p.video_url);
  const full=[p.nome,p.cognome].filter(Boolean).join(' ')||'Portfolio';
  const work=data?.work_experiences||[];
  const education=data?.educations||[];
  const languages=data?.languages||[];
  const skills=data?.skills||[];
  const awards=data?.awards||[];
  const projects=data?.projects||[];
  const cases=data?.case_studies||[];
  const reviews=data?.portfolio_reviews||[];
  const topSkills=skills.slice().sort((a,b)=>Number(b.rating||0)-Number(a.rating||0)).slice(0,6);
  const differentiatingSkills=skills.slice().sort((a,b)=>(Number(b.rating||0)*1.15)-(Number(a.rating||0)*1.15)).slice(0,4);
  const avgReview=reviews.length?reviews.reduce((a,r)=>a+Number(r.rating||0),0)/reviews.length:0;

  async function downloadPdf(){await exportCvPdf(cvRef.current,'CV.pdf')}
  if(loading)return <p className="pageWrap">{t.loading}</p>;
  if(error)return <p className="pageWrap error">{error}</p>;

  return <main className="portfolioPage">
    <div className="portfolioTopbar"><strong>QR Curriculum Portfolio</strong><div><LanguageToggle/><button className="btn primary" onClick={downloadPdf}>{t.downloadPdf}</button></div></div>

    <section className="portfolioHero v20PortfolioHero">
      <div className="portfolioHeroMain">
        <div className="portfolioAvatarWrap">{p.photo_url?<img src={p.photo_url} alt={full} className="portfolioAvatar"/>:<div className="portfolioAvatarFallback">{full.split(' ').map(x=>x[0]).join('').slice(0,2)}</div>}</div>
        <div>
          <span className="portfolioBadge">Professional Portfolio</span>
          <h1>{full}</h1>
          {p.job_title&&<p className="portfolioHeadline">{p.job_title}</p>}
          <p className="portfolioContact">{[p.citta_residenza,p.nazione,p.email_cv,p.telefono].filter(Boolean).join(' · ')}</p>
          {p.summary&&<p className="portfolioSummary">{p.summary}</p>}
          <div className="portfolioActions"><button className="btn primary" onClick={downloadPdf}>{t.downloadPdf}</button>{embed&&<a className="btn" href="#video">Guarda video</a>}<a className="btn" href="#about">Scopri profilo</a></div>
        </div>
      </div>
      <aside className="portfolioIndexBox"><span>Professional Index</span><strong>{worker.score}</strong><p>{worker.label}</p><small>{worker.details?.formula}</small></aside>
    </section>

    <section className="portfolioHeroKpis">
      <article><span>Competenze</span><strong>{skills.length}</strong></article>
      <article><span>Esperienze</span><strong>{work.length}</strong></article>
      <article><span>Progetti</span><strong>{projects.length+cases.length}</strong></article>
      <article><span>Review</span><strong>{reviews.length}</strong></article>
    </section>

    {embed&&<section id="video" className="portfolioVideoSection v20Video"><div><span className="portfolioSectionKicker">Video</span><h2>Video presentazione</h2><p>Una presentazione personale rende il portfolio più umano, diretto e credibile.</p></div><div className="portfolioVideoFrame"><iframe src={embed} title="Video presentazione" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/></div></section>}

    <section id="about" className="portfolioGrid v20IntroGrid">
      <Section title="Chi sono" kicker="Profilo" empty={!p.summary&&!data?.professional_availability}>
        {p.summary&&<p className="portfolioAboutText">{p.summary}</p>}
        {data?.professional_availability?.contact_message&&<p className="portfolioAboutNote">{data.professional_availability.contact_message}</p>}
      </Section>
      <Section title="Top skill" kicker="Focus" empty={!topSkills.length}>
        <div className="portfolioTopSkillList">{topSkills.map(s=><div key={s.id} className="portfolioTopSkill"><div><strong>{s.name}</strong><small>{normalizeCategory(s.category)}</small></div><b>{'★'.repeat(Number(s.rating||0))}{'☆'.repeat(5-Number(s.rating||0))}</b></div>)}</div>
      </Section>
    </section>

    <section className="portfolioGrid">
      <section className="portfolioCard portfolioRadarCard"><span className="portfolioSectionKicker">Skill Radar</span><h2>Radar competenze</h2><div className="portfolioRadarWrap"><svg className="portfolioRadar" viewBox={`0 0 ${SIZE} ${SIZE}`}>{[1,2,3,4,5].map(l=><polygon key={l} className="radarGrid" points={insights.radar.map((_,i)=>axisPoint(i,insights.radar.length,GRID_R*l/5).join(',')).join(' ')}/>)}{insights.radar.map((r,i)=>{const[x,y]=axisPoint(i,insights.radar.length,GRID_R);return <line key={r.category} className="radarAxis" x1={CENTER} y1={CENTER} x2={x} y2={y}/>})}<polygon className="radarArea" points={radarPolygon(insights.radar.map(x=>x.avg))}/>{insights.radar.map((r,i)=>{const[x,y]=axisPoint(i,insights.radar.length,LABEL_R);return <text key={r.category} className="radarLabel" x={Math.max(30,Math.min(SIZE-30,x))} y={Math.max(22,Math.min(SIZE-20,y))} textAnchor={anchor(x)}>{shortLabel(r.category)}</text>})}</svg></div></section>
      <section className="portfolioCard"><span className="portfolioSectionKicker">Index</span><h2>Breakdown</h2><div className="portfolioBreakdown"><span>Completezza <b>{worker.details.profileCompleteness}%</b></span><span>Skill <b>{worker.details.skillQuality}%</b></span><span>Copertura <b>{worker.details.skillCoverage}%</b></span><span>Esperienza <b>{worker.details.experienceEvidence}%</b></span><span>Reputazione <b>{worker.details.reputation}%</b></span><span>Rarità <b>{worker.details.rarityBonus}%</b></span></div></section>
    </section>

    <Section title="Skill differenzianti" kicker="Valore distintivo" empty={!differentiatingSkills.length} className="portfolioFeatureCard">
      <div className="portfolioDifferentiatorGrid">{differentiatingSkills.map(s=><article key={s.id}><span>{normalizeCategory(s.category)}</span><strong>{s.name}</strong><small>Rating {s.rating}/5</small></article>)}</div>
    </Section>

    <Section title="Esperienze" kicker="Timeline" empty={!work.length} className="portfolioTimelineCard">
      <div className="portfolioTimeline">{work.map(x=><TimelineEntry key={x.id} title={x.role_title} meta={[x.company,formatDateRange(x.start_date,x.end_date,lang)].filter(Boolean).join(' · ')}>{!x.hide_description&&x.description}</TimelineEntry>)}</div>
    </Section>

    <Section title="Progetti e case study" kicker="Portfolio operativo" empty={!projects.length&&!cases.length}>
      <div className="portfolioProjectGrid">{projects.map(x=><article key={x.id} className="portfolioProject"><span>Progetto</span><h3>{x.title}</h3><p className="portfolioMeta">{[x.role,formatDateRange(x.start_date,x.end_date,lang)].filter(Boolean).join(' · ')}</p>{!x.hide_description&&<p>{x.description}</p>}</article>)}{cases.map(x=><article key={x.id} className="portfolioProject"><span>Case Study</span><h3>{x.title}</h3>{x.context&&<p><strong>Contesto:</strong> {x.context}</p>}{x.solution&&<p><strong>Soluzione:</strong> {x.solution}</p>}{x.impact&&<p><strong>Impatto:</strong> {x.impact}</p>}</article>)}</div>
    </Section>

    <Section title="Competenze" kicker="Skill complete" empty={!skills.length}><div className="portfolioSkillGrid">{skills.map(s=><span key={s.id} className="portfolioSkill"><strong>{s.name}</strong><small>{normalizeCategory(s.category)} · {s.rating}/5</small></span>)}</div></Section>
    <Section title="Formazione" kicker="Percorso" empty={!education.length}>{education.map(x=><Entry key={x.id} title={x.title} meta={[x.institution,x.field_of_study,formatDateRange(x.start_date,x.end_date,lang)].filter(Boolean).join(' · ')}>{!x.hide_description&&x.description}</Entry>)}</Section>
    <section className="portfolioGrid"><Section title="Lingue" kicker="Comunicazione" empty={!languages.length}>{languages.map(x=><p key={x.id} className="portfolioLine"><strong>{x.lingua}</strong> · {levelLabels[x.livello]?.[lang]||x.livello}</p>)}</Section><Section title="Premi e riconoscimenti" kicker="Risultati" empty={!awards.length}>{awards.map(x=><Entry key={x.id} title={x.title} meta={[x.issuer,x.date].filter(Boolean).join(' · ')}>{!x.hide_description&&x.description}</Entry>)}</Section></section>
    <Section title="Recensioni" kicker={reviews.length?`Media ${avgReview.toFixed(1)}/5`:''} empty={!reviews.length}><div className="portfolioReviewGrid">{reviews.map(r=><article key={r.id} className="portfolioReview"><strong>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</strong><p>“{r.review_text}”</p><small>{[r.reviewer_name,r.reviewer_role,r.reviewer_company].filter(Boolean).join(' · ')}</small></article>)}</div></Section>
    <section id="cv-pdf" className="portfolioCvHidden"><CvTemplate ref={cvRef} data={data} qrCode={qrCode} forcedLang={lang}/></section>
  </main>
}
