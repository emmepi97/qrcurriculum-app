'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import supabase from '@/lib/supabaseClient';
import { LanguageToggle, useLang } from '@/components/LanguageProvider';
import MonetizationPanel from '@/components/MonetizationPanel';
export default function MonetizationPage(){const router=useRouter(); const {t,lang}=useLang(); const [session,setSession]=useState(null); const [loading,setLoading]=useState(true); useEffect(()=>{supabase.auth.getSession().then(({data})=>{if(!data.session){router.push('/login?next=/monetization');return;} setSession(data.session); setLoading(false);});},[router]); if(loading)return <p style={{padding:30}}>{t.loading}</p>; return <><header className="topbar"><strong>QR Curriculum</strong><nav><LanguageToggle/><Link href="/dashboard">{t.dashboard}</Link><Link href="/analytics">{t.analytics}</Link><Link href="/radar-skill">{t.radarSkill}</Link><Link href="/admin">Admin</Link></nav></header><section className="heroPanel"><div className="cleanHero"><p className="eyebrow">{t.monetization}</p><h1>{lang==='en'?'Plans, reviews and professional availability':'Piani, recensioni e disponibilità professionale'}</h1><p>{lang==='en'?'Manage the paid structure and portfolio growth features.':'Gestisci struttura a pagamento e funzioni di crescita portfolio.'}</p></div></section><main className="monetizationPage"><MonetizationPanel userId={session.user.id}/></main></>}
