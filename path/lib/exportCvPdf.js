export async function exportCvPdf(sheetNode, filename = 'CV.pdf') {
  if (!sheetNode) return;

  const html2pdf = (await import('html2pdf.js')).default;
  await new Promise(resolve => setTimeout(resolve, 250));

  const cloneHost = document.createElement('div');
  cloneHost.style.position = 'fixed';
  cloneHost.style.left = '-10000px';
  cloneHost.style.top = '0';
  cloneHost.style.width = '210mm';
  cloneHost.style.height = '297mm';
  cloneHost.style.overflow = 'hidden';
  cloneHost.style.background = '#ffffff';
  cloneHost.style.zIndex = '-1';

  const clone = sheetNode.cloneNode(true);
  clone.style.width = '210mm';
  clone.style.height = '297mm';
  clone.style.maxWidth = '210mm';
  clone.style.maxHeight = '297mm';
  clone.style.minHeight = '297mm';
  clone.style.aspectRatio = '210 / 297';
  clone.style.overflow = 'hidden';
  clone.style.background = '#ffffff';
  cloneHost.appendChild(clone);
  document.body.appendChild(cloneHost);

  try {
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
          width: cloneHost.offsetWidth,
          height: cloneHost.offsetHeight,
          windowWidth: cloneHost.offsetWidth,
          windowHeight: cloneHost.offsetHeight,
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true }
      })
      .from(cloneHost)
      .save();
  } finally {
    cloneHost.remove();
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
