import Link from 'next/link';
export default function HomePage() {
  return <main className="homePage">
    <section className="homeHero">
      <div className="homeCopy"><div className="badge">CV Online</div><h1>Crea, aggiorna e condividi il tuo CV da un solo posto.</h1><p>Inserisci i tuoi dati una volta, aggiornali quando vuoi e ottieni subito un CV pubblico, un QR code e un PDF sempre allineati.</p><div className="homeActions"><Link className="btn primary big" href="/login">Inizia ora</Link><Link className="btn big" href="/dashboard">Apri dashboard</Link></div></div>
      <div className="homePreview"><div className="mockToolbar"><span></span><span></span><span></span></div><div className="mockCv"><h2>Il tuo profilo</h2><p>Ruolo professionale</p><div className="mockLine wide"></div><div className="mockLine"></div><div className="mockSection"></div><div className="mockPills"><i></i><i></i><i></i></div></div></div>
    </section>
    <section className="homeSteps"><article><strong>1</strong><h3>Compili la dashboard</h3><p>Dati personali, esperienze, studi, lingue, skill, progetti e case study.</p></article><article><strong>2</strong><h3>Il CV si aggiorna</h3><p>Anteprima, pagina pubblica e QR code vengono aggiornati automaticamente.</p></article><article><strong>3</strong><h3>Condividi o scarichi</h3><p>Invii il link pubblico oppure scarichi il PDF pronto all'uso.</p></article></section>
  </main>;
}
