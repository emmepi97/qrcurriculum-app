'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'qrcode';
import { supabase } from '@/lib/supabaseClient';
import CvTemplate from '@/components/CvTemplate';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default function PublicCvPage() {
  const params = useParams();
  const slug = params.slug;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    async function loadPublicCv() {
      setLoading(true);
      const { data: personal, error: personalError } = await supabase.from('personal_info').select('*').eq('public_slug', slug).eq('is_public', true).maybeSingle();
      if (personalError || !personal) {
        setError('CV non trovato o non pubblico.');
        setLoading(false);
        return;
      }
      const userId = personal.user_id;
      const tables = ['work_experiences', 'educations', 'languages', 'skills', 'awards', 'projects', 'case_studies'];
      const next = { personal_info: personal };
      for (const table of tables) {
        const { data: rows } = await supabase.from(table).select('*').eq('user_id', userId).eq('is_hidden', false).order('created_at', { ascending: false });
        next[table] = rows || [];
      }
      setData(next);
      QRCode.toDataURL(`${siteUrl}/cv/${slug}`, { width: 180, margin: 1 }).then(setQrCode);
      setLoading(false);
    }
    if (slug) loadPublicCv();
  }, [slug]);

  async function downloadPdf() {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.getElementById('cv-document');
    html2pdf().set({
      margin: 6,
      filename: 'CV.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(element).save();
  }

  if (loading) return <main className="publicPage"><p>Caricamento CV...</p></main>;
  if (error) return <main className="publicPage"><p className="error">{error}</p></main>;

  return (
    <main className="publicPage">
      <div className="publicActions"><button className="btn primary" onClick={downloadPdf}>Scarica PDF</button></div>
      <CvTemplate data={data} qrCode={qrCode} />
    </main>
  );
}
