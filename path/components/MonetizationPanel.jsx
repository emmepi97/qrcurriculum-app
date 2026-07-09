'use client';
import { useEffect, useMemo, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { getSiteUrl } from '@/lib/helpers';
import { useLang } from '@/components/LanguageProvider';

const availabilityFields=[
  ['open_to_work','Nuove opportunità','New opportunities'],
  ['consulting','Consulenze','Consulting'],
  ['freelance','Freelance','Freelance'],
  ['networking','Networking','Networking'],
  ['teaching','Docenze/Formazione','Teaching/Training'],
  ['collaborations','Collaborazioni','Collaborations'],
  ['show_in_directory','Mostrami nella directory','Show me in directory']
];
const emptyAvailability={open_to_work:false,consulting:false,freelance:false,networking:false,teaching:false,collaborations:false,show_in_directory:false,contact_message:''};

export default function MonetizationPanel({userId}){
  const {t,lang}=useLang();
  const [subscription,setSubscription]=useState(null);
  const [availability,setAvailability]=useState(emptyAvailability);
  const [requests,setRequests]=useState([]);
  const [reviews,setReviews]=useState([]);
  const [newReq,setNewReq]=useState({reviewer_name:'',reviewer_email:'',reviewer_role:'',reviewer_company:'',message:''});
  const [msg,setMsg]=useState('');
  const site=getSiteUrl();
  const isPremium=useMemo(()=>subscription&&(subscription.status==='trialing'||subscription.status==='active'||subscription.plan==='premium'),[subscription]);
  useEffect(()=>{ if(userId) load(); },[userId]);
  async function load(){
    setMsg('');
    const {data:sub}=await supabase.from('subscriptions').select('*').eq('user_id',userId).maybeSingle();
    if(!sub){ const {data:created}=await supabase.from('subscriptions').insert({user_id:userId}).select('*').single(); setSubscription(created); } else setSubscription(sub);
    const {data:av}=await supabase.from('professional_availability').select('*').eq('user_id',userId).maybeSingle();
    if(!av){ const {data:createdAv}=await supabase.from('professional_availability').insert({user_id:userId}).select('*').single(); setAvailability(createdAv||emptyAvailability); } else setAvailability(av);
    const {data:reqs}=await supabase.from('review_requests').select('*').eq('owner_user_id',userId).order('created_at',{ascending:false}); setRequests(reqs||[]);
    const {data:revs}=await supabase.from('portfolio_reviews').select('*').eq('owner_user_id',userId).order('created_at',{ascending:false}); setReviews(revs||[]);
  }
  async function saveAvailability(){ const {error}=await supabase.from('professional_availability').upsert({...availability,user_id:userId},{onConflict:'user_id'}); if(error) setMsg(error.message); else setMsg(lang==='en'?'Availability saved.':'Disponibilità salvata.'); }
  async function createRequest(){
    if(!newReq.reviewer_email && !newReq.reviewer_name){ setMsg(lang==='en'?'Enter at least reviewer name or email.':'Inserisci almeno nome o email del referente.'); return; }
    const {error}=await supabase.from('review_requests').insert({...newReq,owner_user_id:userId});
    if(error) setMsg(error.message); else { setNewReq({reviewer_name:'',reviewer_email:'',reviewer_role:'',reviewer_company:'',message:''}); await load(); setMsg(lang==='en'?'Review request created.':'Richiesta recensione creata.'); }
  }
  async function setReviewStatus(id,status){ const {error}=await supabase.from('portfolio_reviews').update({status}).eq('id',id).eq('owner_user_id',userId); if(error) setMsg(error.message); else load(); }
  async function removeReview(id){ if(!confirm('Eliminare recensione?')) return; const {error}=await supabase.from('portfolio_reviews').delete().eq('id',id).eq('owner_user_id',userId); if(error) setMsg(error.message); else load(); }
  return <section className="smartSection wideSection"><div className="smartSectionHeader"><div><h2>{t.monetization}</h2><p>{lang==='en'?'Premium, availability and portfolio reviews.':'Premium, disponibilità e recensioni nel portfolio.'}</p><div className="hint monetizationExplain"><b>{lang==='en'?'Payment structure':'Struttura a pagamento'}</b><p>{lang==='en'?'Free users keep public CV, QR code and basic totals. Premium unlocks advanced analytics, multiple CV versions, directory visibility and portfolio reviews. Stripe is not connected yet, so plan/status can currently be managed from Supabase or the Admin page.':'Gli utenti Free mantengono CV pubblico, QR code e totali base. Premium sblocca analytics avanzati, CV multipli, visibilità in directory e recensioni portfolio. Stripe non è ancora collegato: per ora piano/stato si gestiscono da Supabase o dalla pagina Admin.'}</p></div></div></div>
    <div className="monetizationGrid">
      <article className="miniCard"><h3>{t.premiumAnalytics}</h3><p><b>{subscription?.status||'trialing'}</b> · {subscription?.trial_ends_at?new Date(subscription.trial_ends_at).toLocaleDateString(lang==='en'?'en-US':'it-IT'):''}</p><p className="muted">{isPremium?`${t.trial}/Premium attivo`:'Free base'}</p><button className="btn primary" type="button" onClick={()=>setMsg('Stripe non è ancora collegato: per ora puoi attivare Premium da database.')}>2,99€/mese</button></article>
      <article className="miniCard"><h3>{t.professionalAvailability}</h3><div className="checkGrid">{availabilityFields.map(([k,it,en])=><label key={k} className="check miniCheck"><input type="checkbox" checked={Boolean(availability[k])} onChange={e=>setAvailability({...availability,[k]:e.target.checked})}/> {lang==='en'?en:it}</label>)}</div><textarea rows={3} value={availability.contact_message||''} onChange={e=>setAvailability({...availability,contact_message:e.target.value})} placeholder={lang==='en'?'Contact message':'Messaggio contatto'} /><button className="btn primary" type="button" onClick={saveAvailability}>{t.save}</button></article>
    </div>
    <article className="miniCard full"><h3>{t.requestReview}</h3><p className="hint">{lang==='en'?'Important: the person who writes the review must register and log in before submitting it.':'Importante: chi scrive la recensione deve registrarsi e fare login prima di inviarla.'}</p><div className="quickFormGrid"><input placeholder="Nome referente" value={newReq.reviewer_name} onChange={e=>setNewReq({...newReq,reviewer_name:e.target.value})}/><input placeholder="Email referente" value={newReq.reviewer_email} onChange={e=>setNewReq({...newReq,reviewer_email:e.target.value})}/><input placeholder="Ruolo" value={newReq.reviewer_role} onChange={e=>setNewReq({...newReq,reviewer_role:e.target.value})}/><input placeholder="Azienda" value={newReq.reviewer_company} onChange={e=>setNewReq({...newReq,reviewer_company:e.target.value})}/><textarea className="wide" rows={3} placeholder="Messaggio" value={newReq.message} onChange={e=>setNewReq({...newReq,message:e.target.value})}/></div><button className="btn primary" type="button" onClick={createRequest}>Crea link recensione</button>
      <div className="simpleRows">{requests.map(r=><div className="simpleRow" key={r.id}><div className="simpleRowMain"><strong>{r.reviewer_name||r.reviewer_email||'Richiesta recensione'}</strong><span>{site}/reviews/{r.token}</span></div><div className="simpleRowActions"><span className="hiddenPill lightPill">{r.status}</span><button type="button" onClick={()=>navigator.clipboard?.writeText(`${site}/reviews/${r.token}`)}>Copia link</button></div></div>)}</div></article>
    <article className="miniCard full"><h3>{t.reviews}</h3><div className="simpleRows">{reviews.length===0?<p className="muted">Nessuna recensione ricevuta.</p>:reviews.map(r=><div className="simpleRow" key={r.id}><div className="simpleRowMain"><strong>{'★'.repeat(r.rating)} {'☆'.repeat(5-r.rating)} · {r.reviewer_name} {r.reviewer_company?`- ${r.reviewer_company}`:''}</strong><span>{r.review_text}</span></div><div className="simpleRowActions"><span className="hiddenPill">{r.status}</span><button onClick={()=>setReviewStatus(r.id,'approved')}>Approva</button><button onClick={()=>setReviewStatus(r.id,'hidden')}>Nascondi</button><button className="danger" onClick={()=>removeReview(r.id)}>Elimina</button></div></div>)}</div></article>
    {msg&&<p className="success">{msg}</p>}
  </section>;
}
