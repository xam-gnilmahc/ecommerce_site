import { supabase } from '../supaBaseClient';

/**
 * Invoice PDFs live in this Supabase Storage bucket, one file per order:
 *   invoices/<user_id>/<order_id>.pdf
 * The public URL is written back to `orders.invoice_url`.
 */
export const INVOICE_BUCKET = 'invoices';

const PAGE = { w: 595.28, h: 841.89 }; // A4 in points
const M = 40;
const CONTENT_W = PAGE.w - M * 2;
const MONO = 'courier';

// jsPDF + JsBarcode are heavy, so they are pulled in on demand when an invoice
// is actually written instead of shipping in the storefront bundle.
type JsPdfConstructor = typeof import('jspdf').jsPDF;
type BarcodeFn = (el: any, value: string, options?: any) => void;
export type InvoicePdfDeps = { jsPDF: JsPdfConstructor; barcode: BarcodeFn | null };

async function loadPdfDeps(): Promise<InvoicePdfDeps> {
  const [pdfModule, barcodeModule] = await Promise.all([import('jspdf'), import('jsbarcode')]);
  const barcode = ((barcodeModule as any).default ?? barcodeModule) as BarcodeFn;
  return { jsPDF: pdfModule.jsPDF, barcode };
}

const STORE = {
  name: process.env.REACT_APP_STORE_NAME || 'UOM',
  tagline: process.env.REACT_APP_STORE_TAGLINE || 'Premium Tech Store',
  email: process.env.REACT_APP_STORE_EMAIL || 'maxrai788@gmail.com',
  phone: process.env.REACT_APP_STORE_PHONE || '',
  // multiple lines separated by "|", e.g. "Kamaladi, Kathmandu|Nepal"
  address: (process.env.REACT_APP_STORE_ADDRESS || 'Kami T|Nepal').split('|').filter(Boolean),
};

const money = (value: unknown) => {
  const amount = Number(value) || 0;
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `$${formatted}`;
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const parseAddress = (raw: unknown) => {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, any>) : null;
  } catch {
    return null;
  }
};

const paymentLabel = (log: any) => {
  const method = log?.payment_method;
  if (method === 1) return 'Google Pay';
  if (method === 2) return 'Apple Pay';
  if (method === 0) return 'Card';
  if (log?.charge_id) return 'Card';
  if (log?.stripe_payment_id) return 'Card / Wallet';
  return 'Card / Wallet';
};

/** Code128 of the tracking number (or order id), as a PNG data URL. */
function barcodeDataUrl(value: string, barcode: BarcodeFn | null): string | null {
  if (!barcode || typeof document === 'undefined' || !value) return null;
  try {
    const canvas = document.createElement('canvas');
    barcode(canvas, value, {
      format: 'CODE128',
      width: 2,
      height: 70,
      margin: 0,
      displayValue: false,
      background: '#ffffff',
      lineColor: '#000000',
    });
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

type Customer = { name?: string; email?: string; phone?: string } | null;

/**
 * Builds the invoice document. Mirrors the parcel-label look the store uses:
 * boxed FROM/TO blocks, a monospace meta strip and a Code128 barcode at the
 * bottom. No product imagery.
 */
export function buildInvoicePdf(
  order: any,
  deps: InvoicePdfDeps,
  customer: Customer = null
): InstanceType<JsPdfConstructor> {
  const doc = new deps.jsPDF({ unit: 'pt', format: 'a4', compress: true });

  const items: any[] = order?.order_items ?? [];
  const address = parseAddress(order?.shipping_address) ?? {};
  const log = (order?.orderpayments_logs ?? [])[0] ?? null;

  const subtotal = items.reduce(
    (sum, it) => sum + Number(it.price_each || 0) * Number(it.quantity || 0),
    0
  );
  const paid = Number(order?.total_amount ?? subtotal);
  const shipping = Math.max(0, paid - subtotal);
  const itemQty = items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
  const tracking = String(order?.tracking_number || order?.id || '');
  const shipDate = formatDate(order?.created_at);
  const eta = formatDate(order?.order_date || order?.created_at);

  const charSpace = (value: number) => {
    const anyDoc = doc as any;
    if (typeof anyDoc.setCharSpace === 'function') anyDoc.setCharSpace(value);
  };

  const label = (text: string, x: number, y: number, color = 130) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.4);
    doc.setTextColor(color);
    charSpace(1.1);
    doc.text(text.toUpperCase(), x, y);
    charSpace(0);
  };

  const box = (x: number, y: number, w: number, h: number, fill?: number[]) => {
    if (fill) {
      doc.setFillColor(fill[0], fill[1], fill[2]);
      doc.rect(x, y, w, h, 'F');
    }
    doc.setDrawColor(0);
    doc.setLineWidth(0.8);
    doc.rect(x, y, w, h, 'S');
  };

  // ── Header ────────────────────────────────────────────────
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, PAGE.w, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  doc.text(STORE.name.toUpperCase(), M, 58);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(120, 120, 120);
  charSpace(2.2);
  doc.text(STORE.tagline.toUpperCase(), M, 72);
  charSpace(0);

  doc.setFontSize(17);
  doc.setTextColor(0, 0, 0);
  doc.text('INVOICE', PAGE.w - M, 56, { align: 'right' });

  doc.setFont(MONO, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`INV-${order?.id ?? ''}`, PAGE.w - M, 72, { align: 'right' });

  doc.setDrawColor(0);
  doc.setLineWidth(1.6);
  doc.line(M, 84, PAGE.w - M, 84);

  // ── Meta strip ────────────────────────────────────────────
  const metaY = 96;
  const metaH = 44;
  const metaCells = [
    { label: 'Invoice no', value: `INV-${order?.id ?? ''}`, w: 128 },
    { label: 'Order no', value: String(order?.id ?? ''), w: 108 },
    { label: 'Ship date', value: shipDate, w: 128 },
    { label: 'Tracking no', value: tracking || '—', w: CONTENT_W - 364 },
  ];

  let cellX = M;
  metaCells.forEach((cell) => {
    box(cellX, metaY, cell.w, metaH);
    label(cell.label, cellX + 8, metaY + 14);
    doc.setFont(MONO, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(String(cell.value), cellX + 8, metaY + 30, {
      maxWidth: cell.w - 16,
    });
    cellX += cell.w;
  });

  // ── FROM / TO ─────────────────────────────────────────────
  const partiesY = metaY + metaH + 12;
  const partiesH = 92;
  const halfW = (CONTENT_W - 12) / 2;

  box(M, partiesY, halfW, partiesH);
  label('Ship from', M + 10, partiesY + 15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(0, 0, 0);
  doc.text(`${STORE.name} — ${STORE.tagline}`, M + 10, partiesY + 30);

  doc.setFont(MONO, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  const fromLines = [
    ...(STORE.address.length ? STORE.address : ['Kami T', 'Nepal']),
    STORE.email,
    ...(STORE.phone ? [STORE.phone] : []),
  ];
  fromLines.slice(0, 5).forEach((line, i) => {
    doc.text(line, M + 10, partiesY + 44 + i * 11);
  });

  const toX = M + halfW + 12;
  box(toX, partiesY, halfW, partiesH);
  label('Ship to', toX + 10, partiesY + 15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(0, 0, 0);
  doc.text(String(customer?.name || 'Customer'), toX + 10, partiesY + 30);

  const toLines = [
    address.addressLine1,
    address.addressLine2,
    [address.city, address.state].filter(Boolean).join(', '),
    [address.zipCode, address.country].filter(Boolean).join(' · '),
    address.phone || customer?.email,
  ].filter(Boolean) as string[];

  doc.setFont(MONO, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  toLines.slice(0, 5).forEach((line, i) => {
    doc.text(
      doc.splitTextToSize(String(line), halfW - 20)[0] ?? '',
      toX + 10,
      partiesY + 44 + i * 11
    );
  });

  // ── Delivery / payment summary strip ──────────────────────
  const stripY = partiesY + partiesH + 10;
  const stripH = 36;
  const stripCells = [
    { label: 'Est. delivery', value: eta, w: 150 },
    { label: 'Items', value: String(itemQty), w: 90 },
    {
      label: 'Payment',
      value: String(log?.status || order?.payment_status || '—').toUpperCase(),
      w: 150,
    },
    { label: 'Total paid', value: money(paid), w: CONTENT_W - 390 },
  ];

  cellX = M;
  stripCells.forEach((cell) => {
    box(cellX, stripY, cell.w, stripH);
    label(cell.label, cellX + 8, stripY + 13);
    doc.setFont(MONO, 'bold');
    doc.setFontSize(8.6);
    doc.setTextColor(0, 0, 0);
    doc.text(String(cell.value), cellX + 8, stripY + 26, { maxWidth: cell.w - 16 });
    cellX += cell.w;
  });

  // ── Items table ───────────────────────────────────────────
  const cols = {
    index: { x: M, w: 24 },
    name: { x: M + 24, w: 250 },
    qty: { x: M + 274, w: 44 },
    unit: { x: M + 318, w: 82 },
    line: { x: M + 400, w: CONTENT_W - 400 },
  };

  const drawTableHead = (top: number) => {
    doc.setFillColor(0, 0, 0);
    doc.rect(M, top, CONTENT_W, 20, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(255, 255, 255);
    charSpace(1.1);
    doc.text('#', cols.index.x + 8, top + 13);
    doc.text('ITEM', cols.name.x + 2, top + 13);
    // right-aligned headers skip the letter spacing so they stay inside the box
    charSpace(0);
    doc.text('QTY', cols.qty.x + cols.qty.w - 6, top + 13, { align: 'right' });
    doc.text('UNIT', cols.unit.x + cols.unit.w - 6, top + 13, { align: 'right' });
    doc.text('LINE TOTAL', cols.line.x + cols.line.w - 8, top + 13, { align: 'right' });
    return top + 20;
  };

  let y = drawTableHead(stripY + stripH + 12);

  const tableBottom = 620;
  const rightAlign = (text: string, xRight: number, yPos: number) =>
    doc.text(text, xRight, yPos, { align: 'right' });

  items.forEach((item, i) => {
    const name = String(item?.products?.name || `Product #${item?.product_id ?? ''}`);
    const lines = doc.splitTextToSize(name, cols.name.w - 6) as string[];
    const rowH = Math.max(18, lines.length * 10 + 8);

    if (y + rowH > tableBottom) {
      doc.addPage();
      y = drawTableHead(70);
    }

    if (i % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(M, y, CONTENT_W, rowH, 'F');
    }

    doc.setDrawColor(228, 228, 228);
    doc.setLineWidth(0.5);
    doc.line(M, y + rowH, PAGE.w - M, y + rowH);

    doc.setFont(MONO, 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(110, 110, 110);
    doc.text(String(i + 1), cols.index.x + 8, y + 12);

    doc.setTextColor(20, 20, 20);
    lines.forEach((line, li) => {
      doc.text(line, cols.name.x + 2, y + 12 + li * 10);
    });

    doc.setFont(MONO, 'bold');
    doc.text(String(item?.quantity ?? 0), cols.qty.x + cols.qty.w - 6, y + 12, { align: 'right' });
    doc.setFont(MONO, 'normal');
    doc.setTextColor(70, 70, 70);
    rightAlign(money(item?.price_each), cols.unit.x + cols.unit.w - 6, y + 12);
    doc.setFont(MONO, 'bold');
    doc.setTextColor(0, 0, 0);
    rightAlign(
      money(Number(item?.price_each || 0) * Number(item?.quantity || 0)),
      cols.line.x + cols.line.w - 8,
      y + 12
    );

    y += rowH;
  });

  if (!items.length) {
    doc.setFont(MONO, 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(110, 110, 110);
    doc.text('No line items recorded for this order.', cols.name.x + 2, y + 12);
    y += 20;
  }

  // ── Payment / totals band ─────────────────────────────────
  y += 14;
  const bandH = 78;
  if (y + bandH > 760) {
    doc.addPage();
    y = 70;
  }

  const payW = CONTENT_W * 0.56;
  const totW = CONTENT_W - payW - 12;

  box(M, y, payW, bandH);
  label('Payment', M + 10, y + 15);
  doc.setFont(MONO, 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(40, 40, 40);
  const paymentRows = [
    ['Method', paymentLabel(log)],
    ['Status', String(log?.status || order?.payment_status || '—')],
    ['Transaction', String(log?.stripe_payment_id || log?.charge_id || '—')],
    ['Amount', money(log?.amount ?? paid)],
  ];
  paymentRows.forEach(([k, v], i) => {
    const rowY = y + 30 + i * 12;
    doc.setTextColor(120, 120, 120);
    doc.text(k, M + 10, rowY);
    doc.setTextColor(0, 0, 0);
    doc.text(doc.splitTextToSize(String(v), payW - 90)[0] ?? '', M + 88, rowY);
  });

  const totX = M + payW + 12;
  box(totX, y, totW, bandH);
  label('Summary', totX + 10, y + 15);
  doc.setFont(MONO, 'normal');
  doc.setFontSize(8.2);
  const totalsRows = [
    ['Subtotal', money(subtotal)],
    ['Shipping', shipping > 0 ? money(shipping) : 'Free'],
  ];
  totalsRows.forEach(([k, v], i) => {
    const rowY = y + 32 + i * 12;
    doc.setTextColor(120, 120, 120);
    doc.text(k, totX + 10, rowY);
    doc.setTextColor(0, 0, 0);
    rightAlign(v, totX + totW - 10, rowY);
  });
  doc.setDrawColor(0);
  doc.setLineWidth(1);
  doc.line(totX + 10, y + 58, totX + totW - 10, y + 58);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text('TOTAL PAID', totX + 10, y + 71);
  doc.setFont(MONO, 'bold');
  doc.setFontSize(11);
  rightAlign(money(paid), totX + totW - 10, y + 71);

  // ── Tracking barcode ─────────────────────────────────────
  y += bandH + 14;
  const barcode = tracking ? barcodeDataUrl(tracking, deps.barcode) : null;
  const barH = tracking ? (barcode ? 96 : 58) : 0;
  if (barH) {
    if (y + barH > 790) {
      doc.addPage();
      y = 70;
    }
    box(M, y, CONTENT_W, barH);
    label(barcode ? 'Tracking barcode' : 'Tracking number', M + 10, y + 15);

    if (barcode) {
      const imgW = Math.min(CONTENT_W - 40, 360);
      const imgH = 52;
      doc.addImage(barcode, 'PNG', M + (CONTENT_W - imgW) / 2, y + 20, imgW, imgH);
    }

    doc.setFont(MONO, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    charSpace(2.4);
    doc.text(tracking, PAGE.w / 2, y + (barcode ? 86 : 40), { align: 'center' });
    charSpace(0);
    y += barH;
  }

  // ── Footer ────────────────────────────────────────────────
  let footerY = y + 26;
  if (footerY > 790) {
    doc.addPage();
    footerY = 80;
  }
  doc.setDrawColor(0);
  doc.setLineWidth(0.8);
  doc.line(M, footerY, PAGE.w - M, footerY);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(0, 0, 0);
  doc.text('Thank you for your purchase.', PAGE.w / 2, footerY + 18, { align: 'center' });

  doc.setFont(MONO, 'normal');
  doc.setFontSize(7.4);
  doc.setTextColor(130, 130, 130);
  doc.text(
    `Questions? ${STORE.email}${STORE.phone ? ` · ${STORE.phone}` : ''} · ${STORE.name.toUpperCase()}`,
    PAGE.w / 2,
    footerY + 32,
    { align: 'center' }
  );

  return doc;
}

function invoicePath(userId: string, orderId: string | number) {
  return `${userId}/invoice-${orderId}.pdf`;
}

/** Reads the order (with items + payment log) the invoice is built from. */
async function fetchInvoiceOrder(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(
      `*, order_items (id, product_id, quantity, price_each,
         products:product_id (id, name)),
       orderpayments_logs (*)`
    )
    .eq('id', orderId)
    .single();
  if (error) throw error;
  return data;
}

async function fetchCustomer(userId?: string): Promise<Customer> {
  if (!userId) return null;
  try {
    const { data } = await supabase
      .from('users')
      .select('full_name, name, email')
      .eq('id', userId)
      .maybeSingle();
    if (!data) return null;
    return {
      name: (data as any).full_name || (data as any).name || '',
      email: (data as any).email || '',
    };
  } catch {
    return null;
  }
}

/**
 * Generates the PDF for an order that already exists, uploads it to the
 * `invoices` bucket and stores the public link on `orders.invoice_url`.
 * Returns the link, or null when the order could not be read.
 */
export async function createInvoiceForOrder(orderId: string | number): Promise<string | null> {
  const order = await fetchInvoiceOrder(String(orderId));
  if (!order) return null;

  const customer = await fetchCustomer((order as any).user_id);
  const deps = await loadPdfDeps();
  const doc = buildInvoicePdf(order, deps, customer);
  const blob = doc.output('blob');

  const path = invoicePath(String((order as any).user_id ?? 'unknown'), String(orderId));
  const { error: uploadError } = await supabase.storage
    .from(INVOICE_BUCKET)
    .upload(path, blob, { contentType: 'application/pdf', upsert: true, cacheControl: '3600' });
  if (uploadError) throw uploadError;

  const { data: publicUrl } = supabase.storage.from(INVOICE_BUCKET).getPublicUrl(path);
  const url = publicUrl?.publicUrl ?? null;

  if (url) {
    // Storing the link is best-effort: the PDF itself is already safe in the bucket.
    const { error: updateError } = await supabase
      .from('orders')
      .update({ invoice_url: url })
      .eq('id', orderId);
    if (updateError) {
      console.warn('[invoice] could not save invoice_url on the order', updateError.message);
    }
  }

  return url;
}
