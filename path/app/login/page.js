'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import supabase from '@/lib/supabaseClient';
import { LanguageToggle, useLang } from '@/components/LanguageProvider';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/dashboard';

  const { t } = useLang();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();

    setBusy(true);
    setMsg('');

    const res =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({
            email,
            password,
          })
        : await supabase.auth.signUp({
            email,
            password,
          });

    setBusy(false);

    if (res.error) {
      setMsg(res.error.message);
      return;
    }

    router.push(nextUrl);
  }

  return (
    <main className="authPage">
      <div className="authCard">
        <div className="homeActions">
          /
            ← Home
          </Link>

          <LanguageToggle />
        </div>

        <h1>{mode === 'login' ? t.login : t.signup}</h1>

        <p className="muted">{t.login} QR Curriculum.</p>

        <form onSubmit={submit}>
          <label>
            {t.email}
            <input              type="email"              value={email}              onChange={(e) => setEmail(e.target.value)}              required            />
  
          </label>

          <label>
            {t.password}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>

          {msg && <p className="error">{msg}</p>}

          <button className="btn primary" disabled={busy}>
            {busy ? '...' : mode === 'login' ? t.login : t.signup}
          </button>
        </form>

        <button
          className="linkButton"
          type="button"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
        >
          {mode === 'login'
            ? 'Non hai un account? Registrati'
            : 'Hai già un account? Accedi'}
        </button>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
