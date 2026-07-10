/**
 * exportCvPdf
 * ------------------------------------------------------------------
 * Cattura in PDF esattamente il nodo DOM del foglio CV così com'è
 * renderizzato a schermo (stessa scala, stesso font, stesso layout
 * calcolato da useAutoFitA4). Non esiste più un clone nascosto con
 * regole CSS diverse: anteprima e PDF sono garantiti identici perché
 * sono, letteralmente, la stessa vista.
 *
 * Il foglio ha già un rapporto 210:297 (A4) via aspect-ratio, quindi
 * basta chiedere a jsPDF una pagina A4 e riempirla, senza margini,
 * senza logiche di scala aggiuntive e senza rischio di seconda pagina.
 */
export async function exportCvPdf(sheetNode, filename = 'CV.pdf') {
  if (!sheetNode) return;
  const html2pdf = (await import('html2pdf.js')).default;

  await html2pdf()
    .set({
      margin: 0,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 3, // risoluzione alta, indipendente dalla larghezza a schermo
        useCORS: true,
        backgroundColor: '#ffffff',
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true,
      },
    })
    .from(sheetNode)
    .save();
}

export default exportCvPdf;
