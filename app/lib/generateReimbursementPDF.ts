import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateReimbursementPDF(reimbursement: any, receipts: any[] = []) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const coverPage = pdfDoc.addPage([595, 842]);
  let y = 700;

  coverPage.drawText("AUSLAGENERSTATTUNG", {
    x: 50, y, size: 20, font: boldFont, color: rgb(0, 0, 0)
  });

  y -= 50;
  coverPage.drawText(`${reimbursement.accountHolder}`, {
    x: 50, y, size: 14, font: boldFont, color: rgb(0, 0, 0)
  });

  y -= 30;
  coverPage.drawText(`Gesamtbetrag: ${reimbursement.amount.toFixed(2)} €`, {
    x: 50, y, size: 12, font: boldFont, color: rgb(0, 0, 0)
  });

  y -= 40;
  coverPage.drawText(`IBAN: ${reimbursement.iban}`, { x: 50, y, size: 10, font });
  y -= 15;
  coverPage.drawText(`BIC: ${reimbursement.bic}`, { x: 50, y, size: 10, font });

  y -= 40;
  let totalNet = 0, totalGross = 0;

  for (const receipt of receipts) {
    totalNet += receipt.netAmount || 0;
    totalGross += receipt.grossAmount || 0;
  }

  coverPage.drawText(`Belege: ${receipts.length}`, { x: 50, y, size: 10, font });
  y -= 15;
  coverPage.drawText(`Netto: ${totalNet.toFixed(2)} €`, { x: 50, y, size: 10, font });
  y -= 15;
  coverPage.drawText(`Brutto: ${totalGross.toFixed(2)} €`, {
    x: 50, y, size: 11, font: boldFont, color: rgb(0, 0, 0)
  });

  for (const receipt of receipts) {
    const infoPage = pdfDoc.addPage([595, 842]);
    let infoY = 750;

    infoPage.drawText(`BELEG ${receipt.receiptNumber}`, {
      x: 50, y: infoY, size: 16, font: boldFont, color: rgb(0, 0, 0)
    });

    infoY -= 40;
    infoPage.drawText(`Datum: ${receipt.receiptDate || ''}`, { x: 50, y: infoY, size: 10, font });
    infoY -= 20;
    infoPage.drawText(`Firma: ${receipt.companyName || ''}`, { x: 50, y: infoY, size: 10, font });
    infoY -= 20;
    infoPage.drawText(`${receipt.description || ''}`, { x: 50, y: infoY, size: 10, font });
    infoY -= 20;
    infoPage.drawText(`Betrag: ${(receipt.grossAmount || 0).toFixed(2)} €`, { x: 50, y: infoY, size: 10, font: boldFont });

    if (!receipt.fileUrl) continue;

    try {
      const response = await fetch(receipt.fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      try {
        const receiptPdf = await PDFDocument.load(uint8Array);
        const pages = await pdfDoc.copyPages(receiptPdf, receiptPdf.getPageIndices());
        pages.forEach(page => pdfDoc.addPage(page));
      } catch {
        const imagePage = pdfDoc.addPage([595, 842]);
        let image;

        try {
          image = await pdfDoc.embedJpg(uint8Array);
        } catch {
          try {
            image = await pdfDoc.embedPng(uint8Array);
          } catch {
            continue;
          }
        }

        const { width, height } = image;
        const scale = Math.min(495 / width, 742 / height);
        imagePage.drawImage(image, {
          x: 50, y: 50, width: width * scale, height: height * scale
        });
      }
    } catch {}
  }

  const pdfBytes = await pdfDoc.save();
  const buffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer;
  return new Blob([buffer], { type: "application/pdf" });
}