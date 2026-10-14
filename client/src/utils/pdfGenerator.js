import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export structured study notes as a beautifully formatted PDF
 */
export async function exportNotesToPdf({
  elementId,
  title = 'Study Notes',
  subject = 'Engineering',
  topic = 'General',
  branch = 'CSE',
  marks = '8',
  difficulty = 'Intermediate',
  language = 'English',
  content = ''
}) {
  const isTelugu = language === 'Telugu' || /[\u0C00-\u0C7F]/.test(content);

  // If content is in Telugu or an HTML element is provided, use html2canvas for flawless Unicode glyph rendering
  if (isTelugu && elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      return exportElementAsPdf(element, title, subject);
    }
  }

  // Standard high-speed jsPDF vector layout
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  let currentY = 15;

  // Header Banner
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(margin, currentY, contentWidth, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('ChatGPT Notes Hub', margin + 6, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // #94a3b8
  doc.text('Official AI-Powered College Study Material & Exam Guide', margin + 6, currentY + 16);

  // Marks Badge on top right
  doc.setFillColor(37, 99, 235); // #2563eb
  doc.roundedRect(pageWidth - margin - 35, currentY + 5, 29, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`${marks} Marks Guide`, pageWidth - margin - 32, currentY + 12.5);

  currentY += 28;

  // Metadata Card
  doc.setFillColor(241, 245, 249); // #f1f5f9
  doc.roundedRect(margin, currentY, contentWidth, 20, 2, 2, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(`Subject: ${subject}`, margin + 5, currentY + 6.5);
  doc.text(`Topic: ${topic}`, margin + 5, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Branch: ${branch}  |  Difficulty: ${difficulty}  |  Language: ${language}`, margin + 5, currentY + 17);

  currentY += 26;

  // Clean and parse markdown lines
  const cleanContent = content.replace(/#+\s+/g, '').replace(/\*\*/g, '');
  const lines = cleanContent.split('\n');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');

  const lineHeight = 5.2;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) {
      currentY += 3;
      continue;
    }

    // Check if line looks like a major section heading
    const isHeading = rawLine.startsWith('1.') || rawLine.startsWith('2.') || rawLine.startsWith('3.') ||
                      rawLine.startsWith('4.') || rawLine.startsWith('5.') || rawLine.startsWith('6.') ||
                      rawLine.toUpperCase().includes('OVERVIEW') || rawLine.toUpperCase().includes('DEFINITIONS') ||
                      rawLine.toUpperCase().includes('QUESTIONS') || rawLine.toUpperCase().includes('EXAMPLE');

    // Page overflow check
    if (currentY > pageHeight - 25) {
      addFooter(doc, pageWidth, pageHeight);
      doc.addPage();
      currentY = 18;
    }

    if (isHeading) {
      currentY += 3;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 58, 138); // #1e3a8a
      doc.text(rawLine, margin, currentY);
      doc.setDrawColor(203, 213, 225);
      doc.line(margin, currentY + 1.5, pageWidth - margin, currentY + 1.5);
      currentY += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
    } else {
      const wrapped = doc.splitTextToSize(rawLine, contentWidth);
      for (const wline of wrapped) {
        if (currentY > pageHeight - 25) {
          addFooter(doc, pageWidth, pageHeight);
          doc.addPage();
          currentY = 18;
        }
        doc.text(wline, margin, currentY);
        currentY += lineHeight;
      }
    }
  }

  // Add footer to last page
  addFooter(doc, pageWidth, pageHeight);

  // Set total page numbers
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin - 18, pageHeight - 8);
  }

  // Save PDF
  const safeFilename = `${subject}_${topic}_notes.pdf`.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(safeFilename);
  return safeFilename;
}

function addFooter(doc, pageWidth, pageHeight) {
  const margin = 15;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Disclaimer: AI-generated material should be checked against the official syllabus and textbooks.',
    margin,
    pageHeight - 8
  );
}

/**
 * High-fidelity HTML to PDF converter (used for Telugu text and richly styled components)
 */
export async function exportElementAsPdf(element, title, subject) {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pdfWidth - (margin * 2);

    const imgHeight = (canvas.height * contentWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = margin;

    // First page
    pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeight);
    heightLeft -= (pdfHeight - (margin * 2));

    // Subsequent pages if long
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeight);
      heightLeft -= (pdfHeight - (margin * 2));
    }

    const totalPages = pdf.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      pdf.setPage(p);
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, pdfHeight - 10, pdfWidth - margin, pdfHeight - 10);
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text(
        'Disclaimer: AI-generated material should be checked against the official syllabus and textbooks.',
        margin,
        pdfHeight - 5
      );
      pdf.text(`Page ${p} of ${totalPages}`, pdfWidth - margin - 18, pdfHeight - 5);
    }

    const safeFilename = `${(title || 'notes').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    pdf.save(safeFilename);
    return safeFilename;
  } catch (err) {
    console.error('Error generating canvas PDF:', err);
    throw err;
  }
}
