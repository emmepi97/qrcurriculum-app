'use client';
import { useEffect, useState } from 'react';
const steps=[
  {title:'Benvenuto nella tua dashboard CV',text:'Qui aggiorni i dati una volta sola. CV pubblico, QR code e PDF si aggiornano di conseguenza.'},
  {title:'Parti dalle informazioni personali',text:'Inserisci nome, ruolo, contatti, breve descrizione e, se vuoi, il link a una foto profilo.'},
  {title:'Aggiungi le sezioni del CV',text:'Esperienze, formazione, lingue, skill, premi, progetti e case study sono gestiti con moduli semplici.'},
  {title:'Controlla anteprima e scarica PDF',text:'A destra vedi il risultato in tempo reale. Quando è pronto, scarichi il PDF o condividi il link pubblico.'}
];
export default function FirstAccessTour(){
  const [visible,setVisible]=useState(false); const [index,setIndex]=useState(0);
  useEffect(()=>{if(!window.localStorage.getItem('cv-online-tour-done')) setVisible(true);},[]);
  function closeTour(){window.localStorage.setItem('cv-online-tour-done','true'); setVisible(false);} function next(){index>=steps.length-1?closeTour():setIndex(index+1);} if(!visible) return null; const step=steps[index];
  return <div className="tourOverlay"><div className="tourCard"><div className="tourProgress"><span style={{width:`${((index+1)/steps.length)*100}%`}} /></div><p className="tourStep">Passo {index+1} di {steps.length}</p><h2>{step.title}</h2><p>{step.text}</p><div className="tourActions"><button className="btn" type="button" onClick={closeTour}>Salta tour</button><button className="btn primary" type="button" onClick={next}>{index>=steps.length-1?'Inizia':'Avanti'}</button></div></div></div>;
}
