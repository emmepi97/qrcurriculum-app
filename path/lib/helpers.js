export function getSiteUrl(){
  const envUrl=(process.env.NEXT_PUBLIC_SITE_URL||'').replace(/\/$/,'');
  if(envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) return envUrl;
  if(typeof window!=='undefined' && window.location?.origin) return window.location.origin;
  return envUrl || 'http://localhost:3000';
}
export function makePublicUrl(slug){return slug?`${getSiteUrl()}/cv/${slug}`:''}
export function slugify(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}
export function makePublicSlug({nome,cognome,email}){const base=slugify(`${nome||''} ${cognome||''}`.trim())||slugify(email||'cv');return `${base}-${Math.random().toString(16).slice(2,8)}`}
export function formatMonthYear(date){if(!date)return'';const d=new Date(`${date}T00:00:00`);if(Number.isNaN(d.getTime()))return'';return d.toLocaleDateString('it-IT',{month:'2-digit',year:'numeric'})}
export function cleanDateFields(payload,fields){const next={...payload};fields.forEach(f=>{if(next[f]==='')next[f]=null});return next}
export const levelLabels={native:'Madrelingua',c2:'C2',c1:'C1',b2:'B2',b1:'B1',a2:'A2',a1:'A1',basic:'Base'};
