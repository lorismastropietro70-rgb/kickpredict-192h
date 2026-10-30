import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TicketSelection } from '../types/prediction';

/**
 * Downloads the Schedina ticket as a crisp PDF named 'Schedina_192h_KickPredict.pdf'.
 * Attempts DOM canvas rendering first, with automatic vector fallback.
 */
export async function downloadTicketPDF(
  elementId: string,
  selections: TicketSelection[],
  stake: number,
  totalMultiplier: number,
  potentialWin: number,
  ticketCode: string
): Promise<void> {
  const fileName = 'Schedina_192h_KickPredict.pdf';
  const element = document.getElementById(elementId);

  if (element) {
    try {
      const canvas = await html2canvas(element, {
        scale: 2.5,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(elementId);
          if (clonedElement) {
            clonedElement.style.backgroundColor = '#ffffff';
            clonedElement.style.color = '#000000';
            clonedElement.style.padding = '24px';
            clonedElement.style.border = '2px dashed #000000';
            clonedElement.style.borderRadius = '8px';

            // Hide all screen-only elements in clone
            const noPrintElements = clonedElement.querySelectorAll('.no-print');
            noPrintElements.forEach((el) => {
              (el as HTMLElement).style.display = 'none';
            });

            const allElements = clonedElement.querySelectorAll('*');
            allElements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              htmlEl.style.color = '#000000';
              htmlEl.style.backgroundColor = 'transparent';
              htmlEl.style.borderColor = '#94a3b8';
            });
          }
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const printWidth = pageWidth - margin * 2;
      const printHeight = (canvas.height * printWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', margin, 15, printWidth, printHeight);
      pdf.save(fileName);
      return;
    } catch (err) {
      console.warn('Canvas capture fallback to direct vector PDF:', err);
    }
  }

  // Direct vector PDF generation fallback (crisp, scalable, and instant)
  generateVectorTicketPDF(selections, stake, totalMultiplier, potentialWin, ticketCode, fileName);
}

/**
 * Generates an authentic betting shop receipt vector PDF
 */
export function generateVectorTicketPDF(
  selections: TicketSelection[],
  stake: number,
  totalMultiplier: number,
  potentialWin: number,
  ticketCode: string,
  fileName: string = 'Schedina_192h_KickPredict.pdf'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const avgProbability =
    selections.length > 0
      ? Math.round(
          (selections.reduce((acc, curr) => acc + curr.probability, 0) / selections.length) * 10
        ) / 10
      : 0;

  let y = 18;
  const left = 20;
  const right = 190;
  const width = right - left;

  // Header Box
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.6);

  // Title & Branding
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text('KICKPREDICT 192H · ANALYTICS SPORTS', left + width / 2, y, { align: 'center' });

  y += 7;
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('TICKET SCOMMESSE · CINQUINA 192H', left + width / 2, y, { align: 'center' });

  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `CODICE: ${ticketCode}  ·  DATA: ${new Date().toLocaleDateString('it-IT')}`,
    left + width / 2,
    y,
    { align: 'center' }
  );

  y += 5;
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(left, y, right, y);
  doc.setLineDashPattern([], 0);

  // Table Header
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('EVENTO / PRONOSTICO', left, y);
  doc.text('QUOTA SISAL', right, y, { align: 'right' });

  y += 4;
  doc.line(left, y, right, y);

  // Matches list
  selections.forEach((s, idx) => {
    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`${idx + 1}. ${s.match.homeTeam.name} vs ${s.match.awayTeam.name}`, left, y);

    doc.setFont('helvetica', 'bold');
    doc.text(s.odd.toFixed(2), right, y, { align: 'right' });

    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(70, 70, 70);
    const date = new Date(s.match.fixtureDate);
    const dateStr = `${date.toLocaleDateString('it-IT')} ${date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
    doc.text(
      `${s.match.league.name} · ${dateStr} · Pronostico: ${s.betLabel} (${s.probability}%)`,
      left,
      y
    );
    doc.setTextColor(0, 0, 0);

    y += 3;
    doc.setDrawColor(220, 220, 220);
    doc.line(left, y, right, y);
    doc.setDrawColor(0, 0, 0);
  });

  // Summary section
  y += 8;
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(left, y, right, y);
  doc.setLineDashPattern([], 0);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('MOLTIPLICATORE TOTALE:', left, y);
  doc.setFont('helvetica', 'bold');
  doc.text(`${totalMultiplier.toFixed(2)}x`, right, y, { align: 'right' });

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text('PROBABILITÀ MEDIA:', left, y);
  doc.setFont('helvetica', 'bold');
  doc.text(`${avgProbability}%`, right, y, { align: 'right' });

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text('IMPORTO GIOCATO (PUNTATA):', left, y);
  doc.setFont('helvetica', 'bold');
  doc.text(`${stake.toFixed(2)} EUR`, right, y, { align: 'right' });

  if (selections.length >= 5) {
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text('BONUS CINQUINA (+5%):', left, y);
    doc.setFont('helvetica', 'bold');
    doc.text('INCLUSO', right, y, { align: 'right' });
  }

  y += 7;
  doc.setLineWidth(0.8);
  doc.line(left, y, right, y);
  doc.setLineWidth(0.5);

  y += 7;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('VINCITA POTENZIALE:', left, y);
  doc.text(`${potentialWin.toFixed(2)} EUR`, right, y, { align: 'right' });

  y += 11;
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text('||||| | |||| || | |||||| |||| | ||| |||| | |||||| || |', left + width / 2, y, {
    align: 'center',
  });

  y += 6;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.text(
    '* Gioco riservato ai maggiorenni (+18). Quote indicative verificabili su Sisal/Matchpoint.',
    left + width / 2,
    y,
    { align: 'center' }
  );

  // Outer border rect drawn neatly around content
  const totalBoxHeight = y + 6 - 12;
  doc.rect(left - 5, 12, width + 10, totalBoxHeight, 'S');

  doc.save(fileName);
}

/**
 * Triggers native browser printing with Schedina_192h_KickPredict as the document title
 * so that 'Save as PDF' automatically uses the correct filename.
 */
export function printTicketNative(): void {
  const originalTitle = document.title;
  document.title = 'Schedina_192h_KickPredict';
  window.print();
  setTimeout(() => {
    document.title = originalTitle;
  }, 1500);
}

