'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import { useLang } from '@/components/LanguageProvider';
import AppTopbar from '@/components/AppTopbar';
import ConsultationCTA from '@/components/ConsultationCTA';

export default function AiToolsPage(){
  const router=useRouter();
  const{t,lang}=useLang();
  const[session,setSession]=useState(null);
  const[loading,setLoading]=useState(true);
  const[skills,setSkills]=useState([]);
  const[job,setJob]=useState('');
  const[result,setResult]=useState(null);
  const[analyzing,setAnalyzing]=useState(false);

  useEffect(()=>{supabase.auth.getSession().then(({data})=>{if(!data.session){router.push('/login?next=/ai-tools');return}setSession(data.session)})},[router]);
  useEffect(()=>{if(session?.user?.id)load()},[session?.user?.id]);

  async function load(){
    const{data}=await supabase.from('skills').select('name').eq('user_id',session.user.id).eq('is_hidden',false);
    setSkills((data||[]).map(x=>x.name));
    setLoading(false);
  }

  async function analyze(){
    setAnalyzing(true);
    try{
      const res=await fetch('/api/job-match',{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`},
        body:JSON.stringify({job_text:job,skills,user_id:session.user.id,lang})
      });
      const next=await res.json();
      if(!res.ok)throw new Error(next.error||'Errore durante l\'analisi');
      setResult(next);
    }catch(e){setResult({score:0,matched:[],missing:[],mode:'error',summary:e.message})}
    finally{setAnalyzing(false)}
  }

  if(loading)return <p className="pageWrap">{t.loading}</p>;
  return <>
    <AppTopbar email={session?.user?.email}/>
    <section className='heroPanel'>
      <div className='cleanHero'>
        <div className='eyebrow'>Job Match Score</div>
        <h1>Match gratuito, dettagli Premium</h1>
        <p>Il punteggio percentuale resta gratuito. Il dettaglio con skill trovate, keyword mancanti, aree migliorabili e azioni consigliate è riservato agli utenti Premium.</p>
      </div>
      <div className='cvHeroCard'><span>Modello Premium</span><strong>Score gratis, spiegazione a pagamento</strong><p>In questo modo l'utente vede subito valore e ha un motivo concreto per sbloccare l'analisi.</p></div>
    </section>
    <main className='aiLayout'>
      <section className='aiCard'>
        <div className='smartSectionHeader'><div><h2>Analisi Job Match</h2><p>Incolla la job description completa per calcolare il match.</p></div></div>
        <h3>Job Description</h3>
        <textarea className="jobTextarea jobTextareaProminent" rows={12} value={job} onChange={e=>setJob(e.target.value)} placeholder="Incolla qui annuncio di lavoro..."/>
        <br/><br/>
        <button className="btn primary big" disabled={analyzing||!job.trim()} onClick={analyze}>{analyzing?'Analisi in corso...':'Calcola compatibilità'}</button>
        {result&&<div className="miniCard jobResultCard">
          <h2>Match: {result.score}%</h2>
          <div className="scoreCircle" style={{'--score':`${result.score}%`}}><strong>{result.score}</strong></div>
          {result.jobFamily&&<p className="hint">Famiglia professionale rilevata: <b>{result.jobFamily}</b></p>}
          {result.summary&&result.mode!=='error'&&<p className="hint">{result.summary}</p>}
          {result.mode==='error'&&<p className="pageWrap error">{result.summary}</p>}
          {result.locked? <div className="premiumLockBox">
            <h3>Dettaglio Premium bloccato</h3>
            <p>{result.lockedMessage}</p>
            <ul>
              <li>Skill trovate nell'annuncio</li>
              <li>Keyword mancanti rispetto al CV</li>
              <li>Aree da migliorare</li>
              <li>Azioni consigliate per alzare il match</li>
            </ul>
            <button className="btn primary" onClick={()=>alert('Collega qui Stripe o attiva Premium da Admin.')}>Sblocca Premium</button>
          </div> : <>
            <h3>Skill trovate</h3>
            <div className="tagCloud">{result.matched.length?result.matched.map(x=><span className="tagPill" key={x}>{x}</span>):<span className="muted">Nessuna skill diretta trovata</span>}</div>
            <h3>Keyword mancanti</h3>
            <div className="tagCloud">{result.missing.length?result.missing.map(x=><span className="tagPill" key={x}>{x}</span>):<span className="muted">Nessuna keyword critica mancante</span>}</div>
            {result.improvementAreas&&result.improvementAreas.length>0&&<div className="improvementAreas"><h3>Aree da migliorare e corsi consigliati</h3><div className="improvementGrid">{result.improvementAreas.map(area=><article className={`improvementCard ${area.sponsored?'sponsoredCard':''}`} key={area.category}>{area.sponsored?<><span className="sponsoredTag">Sponsorizzato</span>{area.sponsor.logo_url&&<img className="sponsorLogo" src={area.sponsor.logo_url} alt={area.sponsor.provider_name}/>}<h4>{area.sponsor.title}</h4><p className="muted">{area.categoryLabel}{area.sponsor.provider_name?` · ${area.sponsor.provider_name}`:''}</p><a className="btn primary" href={area.sponsor.url} target="_blank" rel="noreferrer">Scopri il corso</a></>:<><h4>{area.categoryLabel}</h4><b>{t.suggestedSkills}</b><div className="tagCloud">{area.skills.map(x=><span className="tagPill" key={x}>{x}</span>)}</div><b>{t.suggestedCourses}</b><ul>{area.courses.map(x=><li key={x}>{x}</li>)}</ul></>}</article>)}</div></div>}
          </>}
          <div className="ctaBox"><h3>Vuoi questo lavoro ma il match è basso?</h3><ConsultationCTA userId={session?.user?.id} email={session?.user?.email} source="job_match"/></div>
        </div>}
      </section>
      <aside className="aiCard"><h3>Consiglio pratico</h3><p className="muted">Il punteggio ti dà subito un'indicazione. Il dettaglio Premium è il vero prodotto vendibile: spiega cosa manca e cosa fare.</p></aside>
    </main>
  </>;
}
