'use client';
import { useEffect, useState } from 'react';
import { useLang } from '@/components/LanguageProvider';
const stepsIt = [['Benvenuto', 'Da qui gestisci CV, QR, analytics e radar skill.'], ['Profilo /qrcv', 'Il link pubblico usa il formato /qrcv/nomeutente.'], ['Analytics', 'Puoi vedere visite profilo e scansioni QR.'], ['Radar Skill', 'Valuta ogni skill da 1 a 5 e guarda suggerimenti personalizzati.']];
const stepsEn = [['Welcome', 'Manage CV, QR, analytics and skill radar here.'], ['Profile /qrcv', 'The public link uses /qrcv/username.'], ['Analytics', 'Check profile views and QR scans.'], ['Skill Radar', 'Rate each skill from 1 to 5 and get personalized suggestions.']];
export default function FirstAccessTour() {
  const { lang } = useLang();
  const steps = lang === 'en' ? stepsEn : stepsIt;
  const [vis, setVis] = useState(false); const [i, setI] = useState(0);
  useEffect(() => { if (!localStorage.getItem('qrcv-tour-v7')) setVis(true); }, []);
  function close() { localStorage.setItem('qrcv-tour-v7', '1'); setVis(false); }
  if (!vis) return null;
  return <div className="tourOverlay"><div className="tourCard"><div className="tourProgress"><span style={{ width: `${((i + 1) / steps.length) * 100}%` }} /></div><p className="tourStep">Step {i + 1}/{steps.length}</p><h2>{steps[i][0]}</h2><p>{steps[i][1]}</p><div className="tourActions"><button className="btn" onClick={close}>Skip</button><button className="btn primary" onClick={() => i === steps.length - 1 ? close() : setI(i + 1)}>Next</button></div></div></div>;
}
