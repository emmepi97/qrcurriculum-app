'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import AppTopbar from '@/components/AppTopbar';
import { buildCareerPrompt, isPremiumSubscription } from '@/lib/helpers';

const tables=['work_experiences','educations','languages','skills','awards','projects','case_studies'];

export default function CareerPromptPage(){
  const router=useRouter();
  const[session,setSession]=useState(null);
  const[loading,setLoading]=useState(true);
  const[premium,setPremium]=useState(false);
  const[data,setData]=useState(null);
  const[copied,setCopied]=useState(false);

  useEffect(()=>{supabase.auth.getSession().then(({data})=>{if(!data.session){router.push('/login?next=/career-prompt');return}setSession(data.session)})},[router]);
  useEffect(()=>{if(session?.user?.id)load()},[session?.user?.id]);

  async function load(){
    const userId=session.user.id;
    const [{data:sub},{data:p},{data:reviews},{data:matches}]=await Promise.all([
      supabase.from('subscriptions').select('*').eq('user_id',userId).maybeSingle(),
      supabase.from('personal_info').select('*').eq('user_id',userId).maybeSingle(),
      supabase.from('portfolio_reviews').select('*').eq('owner_user_id',userId).eq('status','approved').limit(20),
      supabase.from('ai_generations').select('*').eq('user_id',userId).order('created_at',{ascending:false}).limit(5)
    ]);
    setPremium(isPremiumSubscription(sub));
    const next={profile:p||{},reviews:reviews||[],jobMatches:matches||[]};
    const pairs=await Promise.all(tables.map(async table=>{const{data}=await supabase.from(table).select('*').eq('user_id',userId).eq('is_hidden',false).order('created_at',{ascending:false});return [table,data||[]]}));
    pairs.forEach(([k,v])=>next[k]=v);
    setData(next);
    setLoading(false);
  }
  const prompt=useMemo(()=>data?buildCareerPrompt({profile:data.profile,work:data.work_experiences,education:data.educations,skills:data.skills,projects:data.projects,caseStudies:data.case_studies,awards:data.awards,languages:data.languages,reviews:data.reviews,jobMatches:data.jobMatches}):'', [data]);
  function download(){const blob=new Blob([prompt],{type:'text/plain;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='career-intelligence-prompt.txt';a.click();URL.revokeObjectURL(a.href)}
  function copy(){navigator.clipboard?.writeText(prompt);setCopied(true);setTimeout(()=>setCopied(false),1600)}

  if(loading)return <p className="pageWrap">Caricamento...</p>;
  return <><AppTopbar email={session?.user?.email}/><section className="heroPanel"><div className="cleanHero"><div className="eyebrow">Export Prompt AI</div><h1>Scarica il prompt completo per ChatGPT</h1><p>Funzionalità Premium a costo AI zero: l'utente esporta i propri dati in un prompt strutturato e usa il proprio ChatGPT.</p></div><div className="cvHeroCard"><span>Margine 100%</span><strong>Nessun costo API</strong><p>Vendibile come Career Intelligence Prompt.</p></div></section><main className="pageWrap"><section className="smartSection">{!premium?<div className="premiumLockBox"><h2>Funzione Premium</h2><p>Il Career Prompt esporta CV, portfolio, skill, recensioni e match recenti in un formato già pronto per ChatGPT.</p><button className="btn primary" onClick={()=>alert('Collega qui Stripe o attiva Premium da Admin.')}>Sblocca Premium</button></div>:<><div className="smartSectionHeader"><div><h2>Career Intelligence Prompt</h2><p>Copia o scarica il testo e incollalo su ChatGPT.</p></div><div className="heroSide"><button className="btn" onClick={copy}>{copied?'Copiato':'Copia'}</button><button className="btn primary" onClick={download}>Scarica TXT</button></div></div><textarea className="jobTextareaProminent" rows={22} value={prompt} readOnly /></>}</section></main></>;
}
