'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import AppTopbar from '@/components/AppTopbar';
import { categorizeJobFamily, isPremiumSubscription } from '@/lib/helpers';

function avg(list){return list.length?Math.round((list.reduce((a,b)=>a+b,0)/list.length)*10)/10:0}
function completeness(p){const fields=['nome','cognome','job_title','summary','email_cv','telefono','citta_residenza','photo_url'];return Math.round(fields.filter(f=>String(p?.[f]||'').trim()).length/fields.length*100)}

export default function BenchmarkPage(){
  const router=useRouter();
  const[session,setSession]=useState(null);
  const[loading,setLoading]=useState(true);
  const[premium,setPremium]=useState(false);
  const[me,setMe]=useState(null);
  const[peers,setPeers]=useState([]);
  const[mySkills,setMySkills]=useState([]);
  const[peerSkills,setPeerSkills]=useState([]);
  const[myWork,setMyWork]=useState([]);
  const[peerWork,setPeerWork]=useState([]);

  useEffect(()=>{supabase.auth.getSession().then(({data})=>{if(!data.session){router.push('/login?next=/benchmark');return}setSession(data.session)})},[router]);
  useEffect(()=>{if(session?.user?.id)load()},[session?.user?.id]);

  async function load(){
    const userId=session.user.id;
    const [{data:sub},{data:p},{data:skills},{data:work}]=await Promise.all([
      supabase.from('subscriptions').select('*').eq('user_id',userId).maybeSingle(),
      supabase.from('personal_info').select('*').eq('user_id',userId).maybeSingle(),
      supabase.from('skills').select('*').eq('user_id',userId).eq('is_hidden',false),
      supabase.from('work_experiences').select('*').eq('user_id',userId).eq('is_hidden',false)
    ]);
    setPremium(isPremiumSubscription(sub));setMe(p||{});setMySkills(skills||[]);setMyWork(work||[]);
    const family=categorizeJobFamily(p?.job_title||'');
    const {data:profiles}=await supabase.from('personal_info').select('user_id,nome,cognome,job_title,summary,email_cv,telefono,citta_residenza,photo_url').eq('is_public',true).neq('user_id',userId).limit(250);
    const same=(profiles||[]).filter(x=>categorizeJobFamily(x.job_title||'')===family);
    setPeers(same);
    const ids=same.map(x=>x.user_id).slice(0,80);
    if(ids.length){
      const[{data:ps},{data:pw}]=await Promise.all([
        supabase.from('skills').select('user_id,rating,name,category').in('user_id',ids).eq('is_hidden',false),
        supabase.from('work_experiences').select('user_id,role_title,company').in('user_id',ids).eq('is_hidden',false)
      ]);
      setPeerSkills(ps||[]);setPeerWork(pw||[])
    }
    setLoading(false);
  }

  const family=useMemo(()=>categorizeJobFamily(me?.job_title||''),[me]);
  const metrics=useMemo(()=>{
    const peerIds=peers.map(p=>p.user_id);
    const peerCompleteness=avg(peers.map(completeness));
    const mySkillAvg=avg(mySkills.map(s=>Number(s.rating||0)).filter(Boolean));
    const peerSkillAvg=avg(peerSkills.map(s=>Number(s.rating||0)).filter(Boolean));
    const peerSkillCount=peerIds.length?Math.round(peerSkills.length/peerIds.length*10)/10:0;
    const peerWorkCount=peerIds.length?Math.round(peerWork.length/peerIds.length*10)/10:0;
    return {peerCompleteness,myCompleteness:completeness(me),mySkillAvg,peerSkillAvg,mySkillCount:mySkills.length,peerSkillCount,myWorkCount:myWork.length,peerWorkCount};
  },[peers,me,mySkills,peerSkills,myWork,peerWork]);

  if(loading)return <p className="pageWrap">Caricamento...</p>;
  return <><AppTopbar email={session?.user?.email}/><section className="heroPanel"><div className="cleanHero"><div className="eyebrow">Benchmark Premium</div><h1>Confronto con profili simili</h1><p>Le job description vengono categorizzate in famiglie professionali tramite keyword. Questo permette confronti più sensati tra profili con ruoli simili.</p></div><div className="cvHeroCard"><span>Famiglia rilevata</span><strong>{family}</strong><p>{peers.length} profili pubblici comparabili trovati.</p></div></section><main className="pageWrap"><section className="smartSection">{!premium?<div className="premiumLockBox"><h2>Benchmark Premium bloccato</h2><p>Il confronto con profili simili è una leva Premium perché dà benchmark e pressione competitiva: completezza, skill, media rating e storico esperienze.</p><button className="btn primary" onClick={()=>alert('Collega qui Stripe o attiva Premium da Admin.')}>Sblocca Premium</button></div>:<><div className="smartSectionHeader"><div><h2>Il tuo benchmark</h2><p>Categoria: {family}. Il confronto usa profili pubblici con job title nella stessa famiglia.</p></div></div><div className="analyticsGrid"><div className="metricCard"><span>Completezza profilo</span><strong>{metrics.myCompleteness}%</strong><p className="muted">Media simili: {metrics.peerCompleteness}%</p></div><div className="metricCard"><span>Numero skill</span><strong>{metrics.mySkillCount}</strong><p className="muted">Media simili: {metrics.peerSkillCount}</p></div><div className="metricCard"><span>Rating skill medio</span><strong>{metrics.mySkillAvg}</strong><p className="muted">Media simili: {metrics.peerSkillAvg}</p></div></div><div className="analyticsGrid"><div className="metricCard"><span>Esperienze inserite</span><strong>{metrics.myWorkCount}</strong><p className="muted">Media simili: {metrics.peerWorkCount}</p></div><div className="metricCard"><span>Profili comparabili</span><strong>{peers.length}</strong><p className="muted">Basato su job family</p></div><div className="metricCard"><span>Metodo</span><strong>Keyword</strong><p className="muted">MVP semplice, poi migliorabile con tassonomia/embedding</p></div></div><h3>Come migliorare questo benchmark</h3><ul><li>Aggiungere più profili pubblici aumenta la qualità del confronto.</li><li>La famiglia professionale può essere raffinata nel tempo aggiungendo sinonimi e categorie settoriali.</li><li>Più avanti puoi sostituire la logica keyword con embedding, ma per monetizzare ora questo MVP è già utile.</li></ul></>}</section></main></>;
}
