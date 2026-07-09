'use client';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
export default function OldCvRedirect(){ const {slug}=useParams(); const router=useRouter(); useEffect(()=>{ if(slug) router.replace(`/qrcv/${slug}`); },[slug,router]); return <p>Reindirizzamento al profilo...</p>; }