import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceSettings {
  invoiceCompanyName: string;
  invoiceAddress: string;
  invoicePhone: string;
  invoiceEmail: string;
  invoiceFooter: string;
  invoiceLogo: string;
}

const DEFAULT_SETTINGS: InvoiceSettings = {
  invoiceCompanyName: 'Rivoré',
  invoiceAddress: 'Dhaka, Bangladesh',
  invoicePhone: '',
  invoiceEmail: 'contact@rivore.com',
  invoiceFooter: 'Thank you for choosing Rivore. Crafted with Elegance.',
  invoiceLogo: 'https://res.cloudinary.com/dum9idrbx/image/upload/f_png/q_80/v1776089332/Rivor%C3%A9_fhepjw.png',
};

// Force PNG from Cloudinary URL to avoid WebP (jsPDF can't handle WebP)
function forcePngUrl(url: string): string {
  if (!url) return url;
  // Replace f_auto with f_png in Cloudinary URLs
  return url.replace(/f_auto/g, 'f_png').replace(/f_webp/g, 'f_png');
}

// Fetch image and convert to base64 data URL for PDF embedding
async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const pngUrl = forcePngUrl(url);
    const res = await fetch(pngUrl);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return dateStr;
  }
}

// Use "Tk" instead of ৳ since jsPDF built-in fonts don't support Bengali Unicode
function tk(amount: number, decimals = 2): string {
  return `Tk ${amount.toFixed(decimals)}`;
}

// Open PDF in new tab for printing
function openPdfInBrowser(doc: jsPDF) {
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

// ═══════════════════════════════════════════
//  A4 INVOICE (210mm x 297mm)
// ═══════════════════════════════════════════
export async function generateA4Invoice(order: any, settings?: Partial<InvoiceSettings>) {
  const s = { ...DEFAULT_SETTINGS, ...settings };
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth(); // 210
  const pageH = doc.internal.pageSize.getHeight(); // 297
  const margin = 15;
  let y = margin;

  // --- Logo ---
  const logoData = await fetchImageAsBase64(s.invoiceLogo);
  if (logoData) {
    try {
      doc.addImage(logoData, 'PNG', margin, y, 38, 12);
    } catch (e) {
      console.warn('Logo failed to load in PDF:', e);
    }
  }

  // --- INVOICE title (top right) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(200, 200, 200);
  doc.text('INVOICE', pageW - margin, y + 10, { align: 'right' });

  y += 18;

  // --- Company info (left) ---
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text(s.invoiceCompanyName, margin, y); y += 4;
  doc.text(s.invoiceAddress, margin, y); y += 4;
  if (s.invoicePhone) { doc.text(s.invoicePhone, margin, y); y += 4; }
  if (s.invoiceEmail) { doc.text(s.invoiceEmail, margin, y); y += 4; }

  // --- Invoice number & date (right) ---
  const rightCol = pageW - margin;
  let ry = y - 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text('Invoice #: ' + order._id.slice(-8).toUpperCase(), rightCol, ry, { align: 'right' }); ry += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Date: ' + formatDate(order.createdAt), rightCol, ry, { align: 'right' }); ry += 5;
  doc.text('Status: ' + order.status, rightCol, ry, { align: 'right' });

  y += 4;

  // --- Divider ---
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // --- BILL TO + ORDER DETAILS ---
  const midX = pageW / 2 + 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text('BILL TO', margin, y);
  doc.text('ORDER DETAILS', midX, y);
  y += 5;

  // Customer info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text(order.customer.name, margin, y);

  // Order details (right)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(70, 70, 70);
  let dy = y;
  const labelX = midX;
  const valX = midX + 28;

  doc.text('Order ID:', labelX, dy);
  doc.setFont('helvetica', 'bold');
  const idText = order._id.length > 20 ? order._id.slice(0, 10) + '...' + order._id.slice(-8) : order._id;
  doc.text(idText, valX, dy);
  dy += 5;

  doc.setFont('helvetica', 'normal');
  doc.text('Payment:', labelX, dy);
  doc.setFont('helvetica', 'bold');
  doc.text(order.paymentMethod || 'N/A', valX, dy);
  dy += 5;

  doc.setFont('helvetica', 'normal');
  doc.text('Pay Status:', labelX, dy);
  doc.setFont('helvetica', 'bold');
  doc.text(order.paymentStatus || 'Pending', valX, dy);

  // Continue customer info
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(70, 70, 70);
  doc.text(order.customer.phone, margin, y); y += 4;
  if (order.customer.email) { doc.text(order.customer.email, margin, y); y += 4; }
  doc.text(order.customer.address || '', margin, y); y += 4;
  const cityZip = [order.customer.city, order.customer.zip].filter(Boolean).join(', ');
  if (cityZip) { doc.text(cityZip, margin, y); y += 4; }

  y += 6;

  // --- Items Table ---
  const tableBody = order.items.map((item: any) => [
    item.name,
    (item.type || '').charAt(0).toUpperCase() + (item.type || '').slice(1),
    String(item.quantity),
    tk(item.price),
    tk(item.price * item.quantity),
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Description', 'Type', 'Qty', 'Unit Price', 'Total']],
    body: tableBody,
    styles: {
      fontSize: 9,
      cellPadding: 3.5,
      textColor: [40, 40, 40],
      lineColor: [220, 220, 220],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: [30, 30, 30],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 'auto', halign: 'left' },
      1: { cellWidth: 24, halign: 'center' },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
  });

  // @ts-ignore
  y = (doc as any).lastAutoTable.finalY + 6;

  // --- Totals box (right-aligned) ---
  const boxW = 70;
  const boxX = pageW - margin - boxW;

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.line(boxX, y, pageW - margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text('Subtotal:', boxX, y);
  doc.setTextColor(30, 30, 30);
  doc.text(tk(order.totalAmount), pageW - margin, y, { align: 'right' });
  y += 7;

  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.5);
  doc.line(boxX, y - 1, pageW - margin, y - 1);
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0);
  doc.text('TOTAL:', boxX, y);
  doc.text(tk(order.totalAmount), pageW - margin, y, { align: 'right' });

  // --- Footer (bottom of page) ---
  const footerY = pageH - 15;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.line(margin, footerY - 4, pageW - margin, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text(s.invoiceFooter, pageW / 2, footerY, { align: 'center' });

  // Open in browser's native PDF viewer
  openPdfInBrowser(doc);
}

// ═══════════════════════════════════════════
//  POS RECEIPT (58mm width, dynamic height)
// ═══════════════════════════════════════════
export async function generatePOSInvoice(order: any, settings?: Partial<InvoiceSettings>) {
  const s = { ...DEFAULT_SETTINGS, ...settings };
  const receiptW = 58; // mm — standard POS thermal paper
  const margin = 3;
  const contentW = receiptW - margin * 2;

  // First pass: calculate exact height needed
  // We'll build a temp doc to measure, then create the real one
  const tempDoc = new jsPDF({ unit: 'mm', format: [receiptW, 500] });
  const neededH = measurePOSHeight(tempDoc, order, s, receiptW, margin);

  // Create final doc with exact height
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [receiptW, neededH + 10],
  });

  let y = margin + 2;
  const cx = receiptW / 2;

  // --- Logo ---
  const logoData = await fetchImageAsBase64(s.invoiceLogo);
  if (logoData) {
    try {
      doc.addImage(logoData, 'PNG', cx - 10, y, 20, 6);
      y += 8;
    } catch { /* skip */ }
  }

  // --- Store name ---
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(s.invoiceCompanyName.toUpperCase(), cx, y, { align: 'center' });
  y += 3.5;

  doc.setFontSize(6);
  doc.setFont('courier', 'normal');
  doc.text(s.invoiceAddress, cx, y, { align: 'center' });
  y += 2.5;
  if (s.invoicePhone) {
    doc.text(s.invoicePhone, cx, y, { align: 'center' });
    y += 2.5;
  }

  // --- Dashed divider ---
  y += 1;
  dashedLine(doc, margin, y, receiptW - margin);
  y += 3;

  // --- Order info ---
  doc.setFontSize(7);
  doc.setFont('courier', 'bold');
  doc.text('Order: #' + order._id.slice(-8).toUpperCase(), margin, y);
  y += 3;
  doc.setFont('courier', 'normal');
  doc.text('Date: ' + formatDate(order.createdAt), margin, y);
  y += 4;

  // --- Customer ---
  dashedLine(doc, margin, y, receiptW - margin);
  y += 3;
  doc.setFont('courier', 'bold');
  doc.setFontSize(7);
  doc.text('CUSTOMER:', margin, y);
  y += 3;
  doc.setFont('courier', 'normal');
  doc.text(order.customer.name, margin, y); y += 3;
  doc.text(order.customer.phone, margin, y); y += 3;

  const addrText = [order.customer.address, order.customer.city].filter(Boolean).join(', ');
  const addrLines = doc.splitTextToSize(addrText, contentW);
  addrLines.forEach((line: string) => {
    doc.text(line, margin, y);
    y += 2.5;
  });
  y += 1.5;

  // --- Items header ---
  dashedLine(doc, margin, y, receiptW - margin);
  y += 3;

  doc.setFont('courier', 'bold');
  doc.setFontSize(7);
  const colQty = receiptW - margin - 16;
  const colTk = receiptW - margin;
  doc.text('Item', margin, y);
  doc.text('Qty', colQty, y, { align: 'center' });
  doc.text('Tk', colTk, y, { align: 'right' });
  y += 1;
  dashedLine(doc, margin, y + 0.5, receiptW - margin);
  y += 3;

  // --- Items ---
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  order.items.forEach((item: any) => {
    const nameLines = doc.splitTextToSize(item.name, contentW - 20);
    nameLines.forEach((line: string, i: number) => {
      doc.text(line, margin, y);
      if (i === 0) {
        doc.text(String(item.quantity), colQty, y, { align: 'center' });
        doc.text(String(Math.round(item.price * item.quantity)), colTk, y, { align: 'right' });
      }
      y += 3;
    });
  });

  y += 0.5;
  dashedLine(doc, margin, y, receiptW - margin);
  y += 3;

  // --- Total ---
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL:', margin, y);
  doc.text('Tk ' + Math.round(order.totalAmount), colTk, y, { align: 'right' });
  y += 4;

  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.text('Payment: ' + (order.paymentMethod || 'N/A'), margin, y);
  y += 3;
  doc.text('Status: ' + (order.paymentStatus || 'Pending'), margin, y);
  y += 4;

  // --- Footer ---
  dashedLine(doc, margin, y, receiptW - margin);
  y += 3;
  doc.setFontSize(6);
  const footerLines = doc.splitTextToSize(s.invoiceFooter, contentW);
  footerLines.forEach((line: string) => {
    doc.text(line, cx, y, { align: 'center' });
    y += 2.5;
  });

  // Open in browser
  openPdfInBrowser(doc);
}

// Measure POS receipt height without rendering
function measurePOSHeight(doc: jsPDF, order: any, s: InvoiceSettings, receiptW: number, margin: number): number {
  const contentW = receiptW - margin * 2;
  let y = margin + 2;

  // Logo
  y += 8;
  // Store name + address
  y += 10;
  if (s.invoicePhone) y += 2.5;
  // Divider + order info
  y += 14;
  // Customer
  y += 12;
  const addrText = [order.customer.address, order.customer.city].filter(Boolean).join(', ');
  y += doc.splitTextToSize(addrText, contentW).length * 2.5;
  y += 5;
  // Items header
  y += 6;
  // Items
  order.items.forEach((item: any) => {
    const lines = doc.splitTextToSize(item.name, contentW - 20);
    y += lines.length * 3;
  });
  // Total + payment + footer
  y += 20;
  y += doc.splitTextToSize(s.invoiceFooter, contentW).length * 2.5;

  return y;
}

// Helper: dashed line
function dashedLine(doc: jsPDF, x1: number, y: number, x2: number) {
  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.15);
  let x = x1;
  while (x < x2) {
    const end = Math.min(x + 1.2, x2);
    doc.line(x, y, end, y);
    x = end + 0.8;
  }
}
