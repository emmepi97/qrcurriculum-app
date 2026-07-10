'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import QRCode from 'qrcode';
import supabase from '@/lib/supabaseClient';
import { makeQrUrl } from '@/lib/helpers';
import CvTemplate from '@/components/CvTemplate';
import { LanguageToggle, useLang } from '@/components/LanguageProvider';
export default function PublicQrCvPage(){ const {slug}=useParams(); const params=useSearchParams(); const {t,setLang,lang}=useLang(); const [loading,setLoading]=useState(true); const [error,setError]=useState(''); const [data,setData]=useState(null); const [qrCode,setQrCode]=useState(''); const tracked=useRef(false); useEffect(()=>{ const urlLang=params.get('lang'); if(urlLang==='en'||urlLang==='it') setLang(urlLang); },[params,setLang]); useEffect(()=>{ async function load(){ try{ const {data:p,error:e}=await supabase.from('personal_info').select('*').eq('public_slug',slug).eq('is_public',true).maybeSingle(); if(e||!p){setError(t.profileNotFound);setLoading(false);return;} const next={personal_info:p}; const tables=['work_experiences','educations','languages','skills','awards','projects','case_studies']; const results=await Promise.all(tables.map(async table=>{ const {data:rows}=await supabase.from(table).select('*').eq('user_id',p.user_id).eq('is_hidden',false).order('created_at',{ascending:false}); return [table,rows||[]]; })); results.forEach(([table,rows])=>next[table]=rows); const {data:av}=await supabase.from('professional_availability').select('*').eq('user_id',p.user_id).maybeSingle(); next.professional_availability=av; const {data:reviews}=await supabase.from('portfolio_reviews').select('*').eq('owner_user_id',p.user_id).eq('status','approved').eq('consent_publication',true).order('created_at',{ascending:false}); next.portfolio_reviews=reviews||[]; setData(next); QRCode.toDataURL(makeQrUrl(slug),{width:95,margin:1}).then(setQrCode); if(!tracked.current){ tracked.current=true; const base={profile_user_id:p.user_id,public_slug:slug,path:typeof window!=='undefined'?window.location.pathname:'',referrer:typeof document!=='undefined'?document.referrer:'',user_agent:typeof navigator!=='undefined'?navigator.userAgent:''}; await supabase.from('analytics_events').insert({...base,event_type:'profile_view'}); if(params.get('qr')==='1') await supabase.from('analytics_events').insert({...base,event_type:'qr_scan'}); } }catch(e){ setError(e?.message||t.profileNotFound); }finally{ setLoading(false); } } if(slug) load(); },[slug,params,t.profileNotFound]); async function downloadPdf(){
  const html2pdf=(await import('html2pdf.js')).default;
  const root=document.getElementById('pdf-export-document') || document.getElementById('cv-document');
  const page=root?.querySelector('.cv-page') || root;
  if(!root || !page) return;
  root.classList.add('pdfExportReady');
  page.style.transform='none'; page.style.width='210mm'; page.style.minHeight='0'; page.style.maxHeight='none'; page.style.height='auto'; page.style.overflow='hidden';
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  const a4=document.createElement('div'); a4.style.position='fixed'; a4.style.left='-10000px'; a4.style.top='0'; a4.style.width='210mm'; a4.style.height='297mm'; document.body.appendChild(a4);
  const targetHeight=a4.getBoundingClientRect().height; a4.remove();
  const actualHeight=page.scrollHeight || page.getBoundingClientRect().height || targetHeight;
  const scale=Math.max(0.58,Math.min(1,targetHeight/actualHeight));
  root.style.height=`${targetHeight}px`; root.style.overflow='hidden'; page.style.transformOrigin='center center'; page.style.transform=`scale(${scale})`; page.style.width=`${210/scale}mm`;
  await html2pdf().set({margin:0,filename:'CV.pdf',image:{type:'jpeg',quality:.98},pagebreak:{mode:['avoid-all','css','legacy'],avoid:['.item','.section','.qr-portfolio-block']},html2canvas:{scale:2,useCORS:true,scrollX:0,scrollY:0,windowWidth:1200,backgroundColor:'#ffffff'},jsPDF:{unit:'mm',format:'a4',orientation:'portrait',compress:true}}).from(root).save();
  page.style.transform='none'; page.style.width='210mm'; root.style.height=''; root.style.overflow=''; root.classList.remove('pdfExportReady');
} if(loading) return <p style={{padding:30}}>{t.loading}</p>; if(error) return <p className="error" style={{padding:30}}>{error}</p>; return <main className="publicPage"><div className="publicActions"><LanguageToggle/><button className="btn primary" onClick={downloadPdf}>{t.downloadPdf}</button></div><CvTemplate data={data} qrCode={qrCode} forcedLang={lang}/><div id="pdf-export-document" className="pdfExportOnly"><CvTemplate data={data} qrCode={qrCode} forcedLang={lang}/></div></main>; }
