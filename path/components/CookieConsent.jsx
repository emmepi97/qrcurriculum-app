'use client';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';

const DEFAULT_SETTINGS = {
  banner_title: 'Gestione cookie',
  banner_text: 'Usiamo cookie essenziali per far funzionare il sito e, solo con consenso, cookie analytics per migliorare il servizio.',
  analytics_enabled: true,
  marketing_enabled: false,
  qr_tracking_enabled: true
};

function readConsent() {
  try { return JSON.parse(localStorage.getItem('qrcv_cookie_consent') || 'null'); } catch { return null; }
}

// Nessun pulsante fisso permanente in un angolo dello schermo: il banner
// compare solo alla prima visita (o quando l'utente clicca "Cookie" dal
// menu / dal footer) e poi scompare del tutto finché non viene riaperto.
export default function CookieConsent() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [qrTracking, setQrTracking] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase.from('cookie_settings').select('*').eq('is_active', true).order('updated_at', { ascending: false }).limit(1).maybeSingle();
        if (data) {
          setSettings({ ...DEFAULT_SETTINGS, ...data });
          setAnalytics(!!data.analytics_enabled);
          setMarketing(!!data.marketing_enabled);
          setQrTracking(!!data.qr_tracking_enabled);
        }
      } catch { /* ignore, fallback to defaults */ }
      const saved = readConsent();
      if (!saved) setOpen(true);
    }
    load();
    const handler = () => setOpen(true);
    window.addEventListener('open-cookie-preferences', handler);
    return () => window.removeEventListener('open-cookie-preferences', handler);
  }, []);

  function save(type) {
    const payload = {
      type,
      analytics: type === 'all' ? true : analytics,
      marketing: type === 'all' ? true : marketing,
      qrTracking: type === 'all' ? true : qrTracking,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('qrcv_cookie_consent', JSON.stringify(payload));
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="cookieBanner" role="dialog" aria-label="Gestione cookie">
      <div>
        <h3>{settings.banner_title || DEFAULT_SETTINGS.banner_title}</h3>
        <p>{settings.banner_text || DEFAULT_SETTINGS.banner_text}</p>
        <div className="cookieChoices">
          <label><input type="checkbox" checked readOnly /> Essenziali</label>
          <label><input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} disabled={!settings.analytics_enabled} /> Analytics</label>
          <label><input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} disabled={!settings.marketing_enabled} /> Marketing</label>
          <label><input type="checkbox" checked={qrTracking} onChange={e => setQrTracking(e.target.checked)} disabled={!settings.qr_tracking_enabled} /> Tracking QR</label>
        </div>
      </div>
      <div className="cookieActions">
        <button className="btn" onClick={() => save('essential')}>Solo essenziali</button>
        <button className="btn" onClick={() => save('custom')}>Salva preferenze</button>
        <button className="btn primary" onClick={() => save('all')}>Accetta tutti</button>
      </div>
    </div>
  );
}
