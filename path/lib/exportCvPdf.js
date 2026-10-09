export async function exportCvPdf(sheetNode, filename = 'CV.pdf') {
  if (!sheetNode) return;

  const html2pdf = (await import('html2pdf.js')).default;
  await new Promise(resolve => setTimeout(resolve, 250));

  const original = {
    width: sheetNode.style.width,
    height: sheetNode.style.height,
    maxWidth: sheetNode.style.maxWidth,
    minHeight: sheetNode.style.minHeight,
    overflow: sheetNode.style.overflow,
    background: sheetNode.style.background
  };

  try {
    sheetNode.style.width = '210mm';
    sheetNode.style.height = '297mm';
    sheetNode.style.maxWidth = '210mm';
    sheetNode.style.minHeight = '297mm';
    sheetNode.style.overflow = 'hidden';
    sheetNode.style.background = '#ffffff';

    await html2pdf()
      .set({
        margin: 0,
        filename,
        pagebreak: { mode: ['avoid-all'] },
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          windowWidth: sheetNode.scrollWidth,
          windowHeight: sheetNode.scrollHeight,
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true
        }
      })
      .from(sheetNode)
      .save();
  } finally {
    sheetNode.style.width = original.width;
    sheetNode.style.height = original.height;
    sheetNode.style.maxWidth = original.maxWidth;
    sheetNode.style.minHeight = original.minHeight;
    sheetNode.style.overflow = original.overflow;
    sheetNode.style.background = original.background;
  }
}

export async function exportElementPdf(node, filename = 'report.pdf') {
  if (!node) return;
  const html2pdf = (await import('html2pdf.js')).default;
  await html2pdf().set({
    margin: 8,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true }
  }).from(node).save();
}

export default exportCvPdf;
