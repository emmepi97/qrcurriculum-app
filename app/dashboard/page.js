'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { supabase } from '@/lib/supabaseClient';
import { makePublicSlug } from '@/lib/helpers';
import CvTemplate from '@/components/CvTemplate';
import SectionManager from '@/components/SectionManager';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const sectionConfigs = [
  { title: 'Esperienza', table: 'work_experiences', key: 'work_experiences', fields: [
    { name: 'role_title', label: 'Ruolo' }, { name: 'company', label: 'Azienda' },
    { name: 'start_date', label: 'Inizio', type: 'date' }, { name: 'end_date', label: 'Fine', type: 'date' },
    { name: 'description', label: 'Descrizione', type: 'textarea' }, { name: 'is_hidden', label: 'Nascondi', type: 'checkbox' },
  ]},
  { title: 'Formazione', table: 'educations', key: 'educations', fields: [
    { name: 'title', label: 'Titolo' }, { name: 'institution', label: 'Istituto' }, { name: 'field_of_study', label: 'Indirizzo' },
    { name: 'start_date', label: 'Inizio', type: 'date' }, { name: 'end_date', label: 'Fine', type: 'date' },
    { name: 'location', label: 'Luogo' }, { name: 'grade', label: 'Voto' }, { name: 'description', label: 'Descrizione', type: 'textarea' },
    { name: 'is_hidden', label: 'Nascondi', type: 'checkbox' },
  ]},
  { title: 'Lingue', table: 'languages', key: 'languages', fields: [
    { name: 'lingua', label: 'Lingua' }, { name: 'livello', label: 'Livello', type: 'select', options: [
      { value: 'basic', label: 'Base' }, { value: 'a1', label: 'A1' }, { value: 'a2', label: 'A2' }, { value: 'b1', label: 'B1' }, { value: 'b2', label: 'B2' }, { value: 'c1', label: 'C1' }, { value: 'c2', label: 'C2' }, { value: 'native', label: 'Madrelingua' },
    ]}, { name: 'acquired_date', label: 'Data acquisizione', type: 'date' }, { name: 'is_hidden', label: 'Nascondi', type: 'checkbox' },
  ]},
  { title: 'Competenze', table: 'skills', key: 'skills', fields: [
    { name: 'name', label: 'Competenza' }, { name: 'acquired_date', label: 'Data acquisizione', type: 'date' },
    { name: 'description', label: 'Descrizione', type: 'textarea' }, { name: 'is_hidden', label: 'Nascondi', type: 'checkbox' },
  ]},
  { title: 'Premi & Riconoscimenti', table: 'awards', key: 'awards', fields: [
    { name: 'title', label: 'Titolo' }, { name: 'issuer', label: 'Ente' }, { name: 'date', label: 'Data', type: 'date' },
    { name: 'description', label: 'Descrizione', type: 'textarea' }, { name: 'is_hidden', label: 'Nascondi', type: 'checkbox' },
  ]},
  { title: 'Progetti', table: 'projects', key: 'projects', fields: [
    { name: 'title', label: 'Titolo' }, { name: 'role', label: 'Ruolo' }, { name: 'start_date', label: 'Inizio', type: 'date' },
    { name: 'end_date', label: 'Fine', type: 'date' }, { name: 'description', label: 'Descrizione', type: 'textarea' }, { name: 'is_hidden', label: 'Nascondi', type: 'checkbox' },
  ]},
  { title: 'Case Study', table: 'case_studies', key: 'case_studies', fields: [
    { name: 'title', label: 'Titolo' }, { name: 'date', label: 'Data', type: 'date' }, { name: 'context', label: 'Contesto', type: 'textarea' },
    { name: 'solution', label: 'Soluzione', type: 'textarea' }, { name: 'impact', label: 'Impatto', type: 'textarea' }, { name: 'is_hidden', label: 'Nascondi', type: 'checkbox' },
  ]},
];

const emptyPersonal = {
  nome: '', cognome: '', data_nascita: '', citta_residenza: '', nazione: '', telefono: '', email_cv: '', job_title: '', summary: '', photo_url: '', public_slug: '', is_public: true,
};

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [personal, setPersonal] = useState(emptyPersonal);
  const [data, setData] = useState({ personal_info: emptyPersonal, work_experiences: [], educations: [], languages: [], skills: [], awards: [], projects: [], case_studies: [] });
  const [qrCode, setQrCode] = useState('');

  const publicUrl = useMemo(() => personal.public_slug ? `${siteUrl}/cv/${personal.public_slug}` : '', [personal.public_slug]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: sessionData }) => {
      if (!sessionData.session) {
        router.push('/login');
        return;
      }
      setSession(sessionData.session);
    });
  }, [router]);

  useEffect(() => {
    if (session?.user?.id) loadAll();
  }, [session?.user?.id]);

  useEffect(() => {
    if (!publicUrl) return;
    QRCode.toDataURL(publicUrl, { width: 180, margin: 1 }).then(setQrCode);
  }, [publicUrl]);

  async function loadAll() {
    setLoading(true);
    setError('');
    const userId = session.user.id;
    let { data: p, error: pError } = await supabase.from('personal_info').select('*').eq('user_id', userId).maybeSingle();
    if (pError) setError(pError.message);
    if (!p) {
      const email = session.user.email || '';
      const created = { ...emptyPersonal, user_id: userId, email_cv: email, public_slug: makePublicSlug({ email }) };
      const { data: inserted, error: insertError } = await supabase.from('personal_info').insert(created).select('*').single();
      if (insertError) setError(insertError.message);
      p = inserted;
    }

    const next = { personal_info: p || emptyPersonal };
    for (const section of sectionConfigs) {
      const { data: rows, error: rowsError } = await supabase.from(section.table).select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (rowsError) setError(rowsError.message);
      next[section.key] = rows || [];
    }
    setPersonal(p || emptyPersonal);
    setData(next);
    setLoading(false);
  }

  async function savePersonal(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...personal,
      user_id: session.user.id,
      public_slug: personal.public_slug || makePublicSlug({ nome: personal.nome, cognome: personal.cognome, email: session.user.email }),
    };
    const { data: saved, error: saveError } = await supabase.from('personal_info').upsert(payload, { onConflict: 'user_id' }).select('*').single();
    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setPersonal(saved);
    setData((prev) => ({ ...prev, personal_info: saved }));
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  async function downloadPdf() {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.getElementById('cv-document');
    html2pdf().set({
      margin: 6,
      filename: `CV-${personal.nome || 'online'}-${personal.cognome || ''}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(element).save();
  }

  if (loading) return <main className="appShell"><p>Caricamento...</p></main>;

  return (
    <main className="dashboard">
      <header className="topbar">
        <div><strong>CV Online</strong><span>{session?.user?.email}</span></div>
        <nav>
          {publicUrl ? <a href={publicUrl} target="_blank">CV pubblico</a> : null}
          <button onClick={downloadPdf}>Scarica PDF</button>
          <button onClick={logout}>Logout</button>
        </nav>
      </header>

      <section className="heroPanel">
        <div>
          <h1>Dashboard CV</h1>
          <p>Aggiorna i dati qui: il CV pubblico, il QR e il PDF si aggiornano automaticamente.</p>
          {publicUrl ? <p className="publicUrl">URL pubblico: <a href={publicUrl} target="_blank">{publicUrl}</a></p> : null}
        </div>
        {qrCode ? <img className="qrPreview" src={qrCode} alt="QR code" /> : null}
      </section>

      {error ? <p className="error bigError">{error}</p> : null}

      <div className="workspace">
        <div className="editorColumn">
          <section className="card">
            <div className="section-head"><h2>Informazioni personali</h2><button className="btn primary" onClick={savePersonal} disabled={saving}>{saving ? 'Salvataggio...' : 'Salva dati'}</button></div>
            <form className="personalGrid" onSubmit={savePersonal}>
              <label>Nome<input value={personal.nome || ''} onChange={(e) => setPersonal({ ...personal, nome: e.target.value })} /></label>
              <label>Cognome<input value={personal.cognome || ''} onChange={(e) => setPersonal({ ...personal, cognome: e.target.value })} /></label>
              <label>Job title<input value={personal.job_title || ''} onChange={(e) => setPersonal({ ...personal, job_title: e.target.value })} /></label>
              <label>Email CV<input value={personal.email_cv || ''} onChange={(e) => setPersonal({ ...personal, email_cv: e.target.value })} /></label>
              <label>Telefono<input value={personal.telefono || ''} onChange={(e) => setPersonal({ ...personal, telefono: e.target.value })} /></label>
              <label>Città<input value={personal.citta_residenza || ''} onChange={(e) => setPersonal({ ...personal, citta_residenza: e.target.value })} /></label>
              <label>Nazione<input value={personal.nazione || ''} onChange={(e) => setPersonal({ ...personal, nazione: e.target.value })} /></label>
              <label>Slug pubblico<input value={personal.public_slug || ''} onChange={(e) => setPersonal({ ...personal, public_slug: e.target.value })} /></label>
              <label className="wide">URL foto profilo<input value={personal.photo_url || ''} placeholder="https://..." onChange={(e) => setPersonal({ ...personal, photo_url: e.target.value })} /></label>
              <label className="wide">Chi sono<textarea rows={5} value={personal.summary || ''} onChange={(e) => setPersonal({ ...personal, summary: e.target.value })} /></label>
              <label className="check"><input type="checkbox" checked={Boolean(personal.is_public)} onChange={(e) => setPersonal({ ...personal, is_public: e.target.checked })} /> CV pubblico</label>
            </form>
          </section>

          {sectionConfigs.map((section) => (
            <SectionManager key={section.table} title={section.title} table={section.table} fields={section.fields} rows={data[section.key] || []} userId={session.user.id} onChange={loadAll} />
          ))}
        </div>

        <aside className="previewColumn">
          <div className="previewSticky">
            <div className="previewHead"><h2>Anteprima</h2><button className="btn small primary" onClick={downloadPdf}>PDF</button></div>
            <CvTemplate data={{ ...data, personal_info: personal }} qrCode={qrCode} />
          </div>
        </aside>
      </div>
    </main>
  );
}
