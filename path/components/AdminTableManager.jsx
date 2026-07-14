'use client';
import { useEffect,useMemo,useState } from 'react';
import supabase from '@/lib/supabaseClient';

const MODULES={
  consultation_requests:{icon:'📝',title:'Consulenze CV',short:'Consulenze',description:'Richieste arrivate da pagina consulenza, Job Match e CTA interne.',goal:'Contatta gli utenti, aggiorna stato e note interne.',fields:[['name','Nome'],['email','Email'],['phone','Telefono'],['source','Fonte'],['status','Stato'],['message','Messaggio','textarea'],['price_eur','Prezzo €','number'],['admin_notes','Note admin','textarea']]},
  personal_info:{icon:'👤',title:'Profili utenti',short:'Profili',description:'Dati principali dei portfolio pubblici e dei CV.',goal:'Controlla profili, slug pubblici e visibilità.',fields:[['nome','Nome'],['cognome','Cognome'],['email_cv','Email CV'],['job_title','Job title'],['public_slug','Slug pubblico'],['is_public','Pubblico','checkbox'],['photo_url','Foto URL'],['video_url','Video URL']]},
  subscriptions:{icon:'💳',title:'Licenze e piani',short:'Licenze',description:'Piano, stato abbonamento e periodo di validità.',goal:'Abilita Premium e gestisci stato licenza.',fields:[['plan','Piano'],['status','Stato'],['trial_ends_at','Fine trial'],['current_period_end','Fine periodo'],['stripe_customer_id','Stripe customer'],['stripe_subscription_id','Stripe subscription']]},
  professional_availability:{icon:'🧭',title:'Disponibilità professionale',short:'Disponibilità',description:'Opportunità, consulenze, freelance e preferenze pubbliche.',goal:'Gestisci disponibilità mostrate nel portfolio.',fields:[['open_to_work','Nuove opportunità','checkbox'],['consulting','Consulenze','checkbox'],['freelance','Freelance','checkbox'],['networking','Networking','checkbox'],['teaching','Formazione','checkbox'],['collaborations','Collaborazioni','checkbox'],['show_in_directory','Mostra in directory','checkbox'],['contact_message','Messaggio contatto','textarea']]},
  review_requests:{icon:'📨',title:'Richieste recensione',short:'Richieste review',description:'Inviti generati dagli utenti per ricevere referenze.',goal:'Monitora richieste aperte, completate o chiuse.',fields:[['reviewer_email','Email referente'],['reviewer_name','Nome referente'],['reviewer_role','Ruolo'],['reviewer_company','Azienda'],['message','Messaggio','textarea'],['status','Stato']]},
  portfolio_reviews:{icon:'⭐',title:'Recensioni portfolio',short:'Recensioni',description:'Review ricevute dagli utenti e visibili sul portfolio.',goal:'Approva, nascondi o verifica recensioni.',fields:[['reviewer_name','Nome'],['reviewer_role','Ruolo'],['reviewer_company','Azienda'],['relationship','Relazione'],['rating','Rating','number'],['review_text','Testo recensione','textarea'],['consent_publication','Consenso pubblicazione','checkbox'],['status','Stato']]},
  cv_versions:{icon:'📄',title:'Versioni CV',short:'Versioni CV',description:'Varianti CV eventualmente salvate dagli utenti.',goal:'Controlla configurazioni CV e stato pubblico/premium.',fields:[['title','Titolo'],['slug','Slug'],['lang','Lingua'],['is_premium','Premium','checkbox'],['is_public','Pubblica','checkbox'],['enabled_sections','Sezioni abilitate','json']]},
  ai_generations:{icon:'🤖',title:'Job Match e AI',short:'Job Match',description:'Analisi job description e risultati di compatibilità.',goal:'Vedi utilizzo della funzione e qualità dei risultati.',fields:[['job_text','Job description','textarea'],['match_score','Score','number'],['matched_keywords','Keyword trovate','array'],['missing_keywords','Keyword mancanti','array']]}
};
const ORDER=Object.keys(MODULES);
const NUMS=new Set(['rating','match_score','price_eur']);
const BOOLS=new Set(['open_to_work','consulting','freelance','networking','teaching','collaborations','show_in_directory','consent_publication','is_premium','is_public']);
const JSONS=new Set(['enabled_sections']);
const ARRAYS=new Set(['matched_keywords','missing_keywords']);
const FULL_FIELDS={
  consultation_requests:['user_id','email','name','phone','source','status','message','price_eur','admin_notes'],
  personal_info:['user_id','nome','cognome','email_cv','job_title','public_slug','is_public','photo_url','video_url'],
  subscriptions:['user_id','plan','status','trial_ends_at','current_period_end','stripe_customer_id','stripe_subscription_id'],
  professional_availability:['user_id','open_to_work','consulting','freelance','networking','teaching','collaborations','show_in_directory','contact_message'],
  review_requests:['owner_user_id','reviewer_email','reviewer_name','reviewer_role','reviewer_company','message','status'],
  portfolio_reviews:['owner_user_id','reviewer_user_id','reviewer_name','reviewer_role','reviewer_company','relationship','rating','review_text','consent_publication','status'],
  cv_versions:['user_id','title','slug','lang','is_premium','is_public','enabled_sections'],
  ai_generations:['user_id','job_text','match_score','matched_keywords','missing_keywords']
};
function fieldsFor(table){return FULL_FIELDS[table]||MODULES[table].fields.map(x=>x[0])}
function empty(table){const x={};fieldsFor(table).forEach(f=>{x[f]=BOOLS.has(f)?false:NUMS.has(f)?(f==='price_eur'?25:0):JSONS.has(f)?'{}':''});return x}
function fieldMeta(table,field){const row=MODULES[table].fields.find(x=>x[0]===field);return{label:row?.[1]||field,type:row?.[2]||(BOOLS.has(field)?'checkbox':NUMS.has(field)?'number':JSONS.has(field)?'json':ARRAYS.has(field)?'array':'text')}}
function show(v){if(v==null)return'—';if(typeof v==='boolean')return v?'Sì':'No';if(Array.isArray(v))return v.join(', ');if(typeof v==='object')return JSON.stringify(v);return String(v)}
function clean(form,table){const p={};fieldsFor(table).forEach(f=>{let v=form[f];if(BOOLS.has(f))v=!!v;else if(NUMS.has(f))v=Number(v||0);else if(JSONS.has(f)){try{v=JSON.parse(v||'{}')}catch{v={}}}else if(ARRAYS.has(f))v=String(v||'').split(',').map(x=>x.trim()).filter(Boolean);else if(String(v||'').trim()==='')v=null;p[f]=v});return p}
function rowTitle(table,row){if(table==='consultation_requests')return row.name||row.email||'Richiesta consulenza';if(table==='personal_info')return [row.nome,row.cognome].filter(Boolean).join(' ')||row.email_cv||'Profilo';if(table==='subscriptions')return `${row.plan||'free'} · ${row.status||'stato non indicato'}`;if(table==='portfolio_reviews')return `${row.reviewer_name||'Review'} · ${row.rating||0}/5`;if(table==='ai_generations')return `Job Match ${row.match_score||0}%`;return row.title||row.email||row.status||row.id}
export default function AdminTableManager(){
  const[table,setTable]=useState('consultation_requests');
  const[rows,setRows]=useState([]);
  const[form,setForm]=useState(empty('consultation_requests'));
  const[editId,setEditId]=useState(null);
  const[msg,setMsg]=useState('');
  const[q,setQ]=useState('');
  const[loading,setLoading]=useState(false);
  const[showForm,setShowForm]=useState(false);
  const meta=MODULES[table];
  useEffect(()=>{setForm(empty(table));setEditId(null);setShowForm(false);load()},[table]);
  async function load(){setLoading(true);setMsg('');let res=await supabase.from(table).select('*').order('created_at',{ascending:false}).limit(300);if(res.error){res=await supabase.from(table).select('*').limit(300)}if(res.error)setMsg(res.error.message);setRows(res.data||[]);setLoading(false)}
  function edit(r){const n=empty(table);fieldsFor(table).forEach(f=>{const v=r[f];n[f]=JSONS.has(f)?JSON.stringify(v||{},null,2):ARRAYS.has(f)?(v||[]).join(', '):v??(BOOLS.has(f)?false:'')});setForm(n);setEditId(r.id);setShowForm(true);window.scrollTo({top:0,behavior:'smooth'})}
  async function save(e){e.preventDefault();const payload=clean(form,table);const res=editId?await supabase.from(table).update(payload).eq('id',editId):await supabase.from(table).insert(payload);if(res.error)setMsg(res.error.message);else{setMsg(editId?'Elemento aggiornato correttamente.':'Elemento creato correttamente.');setEditId(null);setForm(empty(table));setShowForm(false);load()}}
  async function del(r){if(!confirm('Eliminare questo elemento?'))return;const{error}=await supabase.from(table).delete().eq('id',r.id);if(error)setMsg(error.message);else{setMsg('Elemento eliminato.');load()}}
  const filtered=useMemo(()=>rows.filter(r=>JSON.stringify(r).toLowerCase().includes(q.toLowerCase())),[rows,q]);
  const stats=useMemo(()=>({total:rows.length,visible:filtered.length,open:rows.filter(r=>String(r.status||'').toLowerCase().includes('open')||String(r.status||'').toLowerCase().includes('requested')).length}),[rows,filtered]);
  const visibleFields=MODULES[table].fields.slice(0,6).map(x=>x[0]);
  return <section className="adminConsole">
    <aside className="adminSidebar"><div className="adminSidebarTitle"><span>Admin</span><strong>Gestione sito</strong></div>{ORDER.map(key=><button key={key} className={key===table?'active':''} onClick={()=>setTable(key)}><span>{MODULES[key].icon}</span><div><strong>{MODULES[key].short}</strong><small>{MODULES[key].title}</small></div></button>)}</aside>
    <main className="adminMainPanel">
      <section className="adminModuleHero"><div><span className="adminKicker">{meta.icon} {meta.short}</span><h2>{meta.title}</h2><p>{meta.description}</p><small>{meta.goal}</small></div><div className="adminModuleStats"><article><span>Totale</span><strong>{stats.total}</strong></article><article><span>Filtrati</span><strong>{stats.visible}</strong></article><article><span>Da gestire</span><strong>{stats.open}</strong></article></div></section>
      <section className="adminToolbar"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cerca in questa sezione..."/><div><button className="btn" onClick={load}>{loading?'Carico...':'Aggiorna'}</button><button className="btn primary" onClick={()=>{setEditId(null);setForm(empty(table));setShowForm(v=>!v)}}>{showForm?'Chiudi form':'Nuovo elemento'}</button></div></section>
      {msg&&<p className={msg.toLowerCase().includes('erro')?'error':'success'}>{msg}</p>}
      {showForm&&<form className="adminEditPanel" onSubmit={save}><div className="adminEditHead"><div><span>{editId?'Modifica':'Crea'}</span><h3>{meta.short}</h3></div>{editId&&<button type="button" className="btn" onClick={()=>{setEditId(null);setForm(empty(table))}}>Svuota</button>}</div><div className="adminFormGrid">{fieldsFor(table).map(f=>{const fm=fieldMeta(table,f);if(fm.type==='checkbox')return <label key={f} className="adminCheck"><input type="checkbox" checked={!!form[f]} onChange={e=>setForm({...form,[f]:e.target.checked})}/><span>{fm.label}</span></label>;if(['textarea','json'].includes(fm.type))return <label key={f} className="wide">{fm.label}<textarea rows={fm.type==='json'?5:4} value={form[f]||''} onChange={e=>setForm({...form,[f]:e.target.value})}/></label>;return <label key={f}>{fm.label}<input type={fm.type==='number'?'number':'text'} value={form[f]??''} onChange={e=>setForm({...form,[f]:e.target.value})}/></label>})}</div><div className="adminFormActions"><button type="button" className="btn" onClick={()=>setShowForm(false)}>Annulla</button><button className="btn primary">{editId?'Salva modifiche':'Crea elemento'}</button></div></form>}
      <section className="adminRecordList">{loading?<div className="adminEmpty">Caricamento...</div>:filtered.length===0?<div className="adminEmpty"><h3>Nessun elemento trovato</h3><p>Prova a cambiare ricerca oppure crea un nuovo elemento.</p></div>:filtered.map(r=><article key={r.id} className="adminRecordCard"><div className="adminRecordTop"><div><span>{meta.icon}</span><strong>{rowTitle(table,r)}</strong><small>{r.created_at?new Date(r.created_at).toLocaleString('it-IT'):r.id}</small></div><div><button onClick={()=>edit(r)}>Modifica</button><button className="danger" onClick={()=>del(r)}>Elimina</button></div></div><div className="adminRecordFields">{visibleFields.map(f=>{const fm=fieldMeta(table,f);return <p key={f}><span>{fm.label}</span><b>{show(r[f])}</b></p>})}</div></article>)}</section>
    </main>
  </section>
}
