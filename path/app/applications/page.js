'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import AppTopbar from '@/components/AppTopbar';

const empty={company:'',role_title:'',job_url:'',source:'',status:'saved',priority:'medium',job_text:'',match_score:'',notes:'',next_action:'',next_action_date:'',applied_at:''};
const statuses=['saved','applied','screening','interview','offer','rejected','withdrawn'];

export default function ApplicationsPage(){
  const router=useRouter();
  const[session,setSession]=useState(null);
  const[loading,setLoading]=useState(true);
  const[rows,setRows]=useState([]);
  const[form,setForm]=useState(empty);
  const[editing,setEditing]=useState(null);
  const[filter,setFilter]=useState('all');
  const[msg,setMsg]=useState('');

  useEffect(()=>{supabase.auth.getSession().then(({data})=>{if(!data.session){router.push('/login?next=/applications');return}setSession(data.session)})},[router]);
  useEffect(()=>{if(session?.user?.id)load()},[session?.user?.id]);

  async function load(){
    setLoading(true);
    const{data,error}=await supabase.from('job_applications').select('*').eq('user_id',session.user.id).order('created_at',{ascending:false});
    if(error)setMsg(error.message); else setRows(data||[]);
    setLoading(false);
  }
  function startEdit(row){setEditing(row.id);setForm({...empty,...row,match_score:row.match_score??'',next_action_date:row.next_action_date||'',applied_at:row.applied_at||''});window.scrollTo({top:0,behavior:'smooth'})}
  function reset(){setEditing(null);setForm(empty)}
  async function save(e){
    e.preventDefault();setMsg('');
    const payload={...form,user_id:session.user.id,match_score:form.match_score===''?null:Number(form.match_score),next_action_date:form.next_action_date||null,applied_at:form.applied_at||null};
    const q=editing?supabase.from('job_applications').update(payload).eq('id',editing).eq('user_id',session.user.id):supabase.from('job_applications').insert(payload);
    const{error}=await q;
    if(error)setMsg(error.message); else{setMsg(editing?'Candidatura aggiornata.':'Candidatura aggiunta.');reset();load()}
  }
  async function remove(row){if(!confirm('Eliminare questa candidatura?'))return;const{error}=await supabase.from('job_applications').delete().eq('id',row.id).eq('user_id',session.user.id);if(error)setMsg(error.message);else load()}
  const filtered=useMemo(()=>filter==='all'?rows:rows.filter(r=>r.status===filter),[rows,filter]);
  const stats=useMemo(()=>({tot:rows.length,applied:rows.filter(r=>r.status==='applied').length,interview:rows.filter(r=>r.status==='interview').length,offer:rows.filter(r=>r.status==='offer').length}),[rows]);

  if(loading)return <p className="pageWrap">Caricamento...</p>;
  return <><AppTopbar email={session?.user?.email}/><section className="heroPanel"><div className="cleanHero"><div className="eyebrow">Application Tracker</div><h1>Traccia le candidature</h1><p>Salva annunci, stato, match score, prossima azione e note. Questa pagina trasforma il prodotto da CV builder a strumento operativo per cercare lavoro.</p></div><div className="cvHeroCard"><span>{stats.tot} candidature</span><strong>{stats.interview} colloqui · {stats.offer} offerte</strong><p>Usala come CRM personale per la ricerca lavoro.</p></div></section><main className="pageWrap applicationsPage"><section className="smartSection"><h2>{editing?'Modifica candidatura':'Nuova candidatura'}</h2><form className="quickForm" onSubmit={save}><div className="quickFormGrid"><label>Azienda<input value={form.company} onChange={e=>setForm({...form,company:e.target.value})}/></label><label>Ruolo<input required value={form.role_title} onChange={e=>setForm({...form,role_title:e.target.value})}/></label><label>URL annuncio<input value={form.job_url||''} onChange={e=>setForm({...form,job_url:e.target.value})}/></label><label>Fonte<input value={form.source||''} placeholder="LinkedIn, Indeed, referral..." onChange={e=>setForm({...form,source:e.target.value})}/></label><label>Stato<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{statuses.map(s=><option key={s} value={s}>{s}</option>)}</select></label><label>Priorità<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option value="low">low</option><option value="medium">medium</option><option value="high">high</option></select></label><label>Match score<input type="number" min="0" max="100" value={form.match_score??''} onChange={e=>setForm({...form,match_score:e.target.value})}/></label><label>Data candidatura<input type="date" value={form.applied_at||''} onChange={e=>setForm({...form,applied_at:e.target.value})}/></label><label>Prossima azione<input value={form.next_action||''} onChange={e=>setForm({...form,next_action:e.target.value})}/></label><label>Data prossima azione<input type="date" value={form.next_action_date||''} onChange={e=>setForm({...form,next_action_date:e.target.value})}/></label><label className="wide">Job description<textarea rows={5} value={form.job_text||''} onChange={e=>setForm({...form,job_text:e.target.value})}/></label><label className="wide">Note<textarea rows={3} value={form.notes||''} onChange={e=>setForm({...form,notes:e.target.value})}/></label></div><div className="quickFormActions splitActions"><button type="button" className="btn" onClick={reset}>Pulisci</button><button className="btn primary">{editing?'Salva modifiche':'Aggiungi candidatura'}</button></div></form>{msg&&<p className="success">{msg}</p>}</section><section className="smartSection"><div className="smartSectionHeader"><div><h2>Pipeline candidature</h2><p>{filtered.length} elementi visualizzati</p></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Tutti gli stati</option>{statuses.map(s=><option key={s} value={s}>{s}</option>)}</select></div><div className="simpleRows">{filtered.length?filtered.map(r=><div className="simpleRow applicationRow" key={r.id}><div className="simpleRowMain"><strong>{r.role_title} · {r.company}</strong><span>{r.status} · priorità {r.priority}{r.match_score!=null?` · match ${r.match_score}%`:''}</span>{r.next_action&&<span>Prossima azione: {r.next_action}{r.next_action_date?` (${r.next_action_date})`:''}</span>}</div><div className="simpleRowActions"><button onClick={()=>startEdit(r)}>Modifica</button>{r.job_url&&<a href={r.job_url} target="_blank" rel="noreferrer">Annuncio</a>}<button className="danger" onClick={()=>remove(r)}>Elimina</button></div></div>):<p className="muted">Nessuna candidatura ancora inserita.</p>}</div></section></main></>;
}
