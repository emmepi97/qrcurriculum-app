import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="landing">
      <section className="landingCard">
        <div className="badge">CV Online</div>
        <h1>Il tuo CV sempre pronto, aggiornato e condivisibile.</h1>
        <p>
          Salvi i dati in Supabase, aggiorni tutto da dashboard, generi PDF e QR code verso il tuo CV pubblico.
        </p>
        <div className="actions">
          <Link className="btn primary" href="/login">Accedi / Registrati</Link>
          <Link className="btn" href="/dashboard">Vai alla dashboard</Link>
        </div>
      </section>
    </main>
  );
}
