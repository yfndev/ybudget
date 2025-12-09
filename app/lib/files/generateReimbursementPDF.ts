import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateReimbursementPDF(
  reimbursement: any,
  receipts: any[] = [],
) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const WIDTH = 595;
  const HEIGHT = 842;
  const M = 50;

  const coverPage = pdfDoc.addPage([WIDTH, HEIGHT]);
  let y = 700;

  coverPage.drawText("AUSLAGENERSTATTUNG", {
    x: M,
    y,
    size: 20,
    font: boldFont,
  });
  y -= 50;
  coverPage.drawText(reimbursement.accountHolder, {
    x: M,
    y,
    size: 14,
    font: boldFont,
  });
  y -= 30;
  coverPage.drawText(`Gesamtbetrag: ${reimbursement.amount.toFixed(2)} €`, {
    x: M,
    y,
    size: 12,
    font: boldFont,
  });
  y -= 40;
  coverPage.drawText(`IBAN: ${reimbursement.iban}`, {
    x: M,
    y,
    size: 10,
    font,
  });
  y -= 15;
  coverPage.drawText(`BIC: ${reimbursement.bic}`, { x: M, y, size: 10, font });
  y -= 40;

  let totalNet = 0;
  let totalGross = 0;
  for (const r of receipts) {
    totalNet += r.netAmount || 0;
    totalGross += r.grossAmount || 0;
  }

  coverPage.drawText(`Belege: ${receipts.length}`, { x: M, y, size: 10, font });
  y -= 15;
  coverPage.drawText(`Netto: ${totalNet.toFixed(2)} €`, {
    x: M,
    y,
    size: 10,
    font,
  });
  y -= 15;
  coverPage.drawText(`Brutto: ${totalGross.toFixed(2)} €`, {
    x: M,
    y,
    size: 11,
    font: boldFont,
  });

  for (const r of receipts) {
    const page = pdfDoc.addPage([WIDTH, HEIGHT]);
    let y = HEIGHT - M;

    page.drawText(`BELEG ${r.receiptNumber}`, {
      x: M,
      y,
      size: 16,
      font: boldFont,
    });
    y -= 35;
    page.drawText(`Datum: ${r.receiptDate || ""}`, { x: M, y, size: 10, font });
    y -= 18;
    page.drawText(`Firma: ${r.companyName || ""}`, { x: M, y, size: 10, font });

    if (r.description) {
      y -= 18;
      page.drawText(r.description, {
        x: M,
        y,
        size: 10,
        font,
        color: rgb(0.4, 0.4, 0.4),
      });
    }

    y -= 25;
    const tax = ((r.grossAmount || 0) - (r.netAmount || 0)).toFixed(2);
    page.drawText(`Netto: ${(r.netAmount || 0).toFixed(2)} €`, {
      x: M,
      y,
      size: 10,
      font,
    });
    y -= 15;
    page.drawText(`MwSt. (${r.taxRate || 0}%): ${tax} €`, {
      x: M,
      y,
      size: 10,
      font,
    });
    y -= 15;
    page.drawText(`Brutto: ${(r.grossAmount || 0).toFixed(2)} €`, {
      x: M,
      y,
      size: 11,
      font: boldFont,
    });

    if (!r.fileUrl) continue;

    y -= 30;
    const imageHeight = y - M;

    try {
      const res = await fetch(r.fileUrl);
      const bytes = new Uint8Array(await res.arrayBuffer());

      try {
        const receiptPdf = await PDFDocument.load(bytes);
        const [embeddedPage] = await pdfDoc.embedPdf(receiptPdf, [0]);
        const { width, height } = embeddedPage;
        const scale = Math.min((WIDTH - 2 * M) / width, imageHeight / height);
        page.drawPage(embeddedPage, {
          x: M,
          y: M,
          xScale: scale,
          yScale: scale,
        });
      } catch {
        let image;
        try {
          image = await pdfDoc.embedJpg(bytes);
        } catch {
          try {
            image = await pdfDoc.embedPng(bytes);
          } catch {
            continue;
          }
        }

        const { width, height } = image;
        const scale = Math.min((WIDTH - 2 * M) / width, imageHeight / height);
        page.drawImage(image, {
          x: M,
          y: M,
          width: width * scale,
          height: height * scale,
        });
      }
    } catch {}
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], {
    type: "application/pdf",
  });
}
