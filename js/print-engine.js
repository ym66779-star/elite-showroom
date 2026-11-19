/* ============================================================================
   Abu Bahaa Showroom - Unified Hidden-Iframe A4 Print Engine (v9)
   Handles: Bank Proforma, Inspection Certificate, Sale Contract, Deposit Receipt,
            QR Window Sticker, Installment Plans Table, and Car Quote Sheet.
   ============================================================================ */

class PrintEngine {
  static FRAME_ID = 'abu-bahaa-print-frame';

  static getLogoUrl() {
    return new URL('./logo.jpg', window.location.href).href;
  }

  static buildWatermarkHtml() {
    return `
      <div style="position:fixed; inset:0; display:flex; align-items:center; justify-content:center; pointer-events:none; z-index:0; opacity:0.04;">
        <img src="${this.getLogoUrl()}" style="width:360px; height:360px; object-fit:contain;" />
      </div>
    `;
  }

  static buildLetterheadHtml() {
    const logoUrl = this.getLogoUrl();
    return `
      <div style="position:relative; z-index:1; display:flex; align-items:center; justify-content:space-between; background:#090d16; color:#ffffff; padding:12px 16px; border-radius:14px; margin-bottom:14px; border-bottom:4px solid #f59e0b; -webkit-print-color-adjust:exact; print-color-adjust:exact;">
        <div style="display:flex; align-items:center; gap:12px;">
          <img src="${logoUrl}" alt="أبو بهاء" style="width:54px; height:54px; border-radius:12px; border:2px solid #f59e0b; object-fit:cover; background:#020617;" />
          <div>
            <div style="font-size:18px; font-weight:900; color:#ffffff; letter-spacing:0.3px;">${escapeHtml(DEALER_BRAND_NAME)}</div>
            <div style="font-size:11px; font-weight:700; color:#fcd34d; margin-top:2px;">📍 ${escapeHtml(DEALER_ADDRESS)}</div>
          </div>
        </div>
        <div style="text-align:left; font-size:10.5px; font-weight:800; color:#f8fafc; line-height:1.6;" dir="ltr">
          <div style="color:#f59e0b; font-weight:900;">📞 HOTLINES &amp; WHATSAPP</div>
          <div>010 60 97 0007 | 010 01 44 6377</div>
          <div>010 91 16 7083 | 010 63 76 4207</div>
        </div>
      </div>
    `;
  }

  static buildFooterHtml() {
    const logoUrl = this.getLogoUrl();
    return `
      <div style="position:relative; z-index:1; margin-top:12px; padding:8px 14px; border:2px solid #0f172a; border-radius:12px; background:#f8fafc; display:flex; justify-content:space-between; align-items:center; font-size:10.5px; font-weight:800; color:#0f172a; -webkit-print-color-adjust:exact; print-color-adjust:exact;">
        <div style="display:flex; align-items:center; gap:8px;">
          <img src="${logoUrl}" style="width:24px; height:24px; border-radius:6px; object-fit:cover;" />
          <span>📍 ${escapeHtml(DEALER_BRAND_NAME)} — ${escapeHtml(DEALER_ADDRESS)}</span>
        </div>
        <div dir="ltr">📞 ${escapeHtml(DEALER_PHONES_DISPLAY)}</div>
      </div>
    `;
  }

  static printHtmlInIframe(fullHtml) {
    let printFrame = document.getElementById(this.FRAME_ID);
    if (printFrame) printFrame.remove();

    printFrame = document.createElement('iframe');
    printFrame.id = this.FRAME_ID;
    printFrame.style.cssText = 'position:fixed; right:0; bottom:0; width:0; height:0; border:0; visibility:hidden;';
    document.body.appendChild(printFrame);

    const printWin = printFrame.contentWindow;
    const doc = printWin.document;
    doc.open();
    doc.write(fullHtml);
    doc.close();

    setTimeout(() => {
      try {
        printWin.focus();
        printWin.print();
      } catch (e) {
        console.warn('Iframe print trigger error:', e);
      }
    }, 450);
  }

  /**
   * Prints the Official Bank Proforma Invoice (عرض سعر رسمي للبنك) in A4 portrait.
   */
  static printBankProforma({
    car,
    bankName,
    clientName,
    clientNid,
    clientPhone,
    total,
    pct,
    down,
    loan,
    chassis,
    engineColor,
    notes
  }) {
    const today = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    const refNo = 'BNK-' + Date.now().toString().slice(-6);
    const carTitle = car ? `${car.brand || ''} ${car.model || ''}`.trim() : '';
    const carYear = car?.year || '';
    const carPaint = car?.paintStatus || 'مفحوصة';
    const carMileage = Number(car?.mileageKm || 0).toLocaleString('ar-EG');

    const fullHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>عرض سعر للبنك - ${escapeHtml(carTitle)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800;900&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: 'Cairo', Tahoma, Arial, sans-serif; margin: 0; padding: 0; color: #0f172a; background: #ffffff; direction: rtl; }
  </style>
</head>
<body>
  <div style="position:relative; padding:4px;">
    ${this.buildWatermarkHtml()}
    ${this.buildLetterheadHtml()}

    <div style="position:relative; z-index:1; border:2px solid #0f172a; border-radius:14px; padding:16px; background:#ffffff;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px dashed #cbd5e1; padding-bottom:10px; margin-bottom:12px;">
        <div>
          <h2 style="margin:0; font-size:19px; font-weight:900; color:#0f172a;">عرض سعر رسمي موجّه لجهة التمويل (Proforma Invoice)</h2>
          <p style="margin:4px 0 0; font-size:13px; font-weight:800; color:#b45309;">إلى السادة / ${escapeHtml(bankName)}</p>
        </div>
        <div style="text-align:left; font-size:11px; font-weight:800; color:#334155;">
          <div>رقم العرض: <span style="font-family:monospace; color:#0f172a;">${refNo}</span></div>
          <div>التاريخ: ${today}</div>
        </div>
      </div>

      <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:10px; padding:10px 14px; margin-bottom:12px; font-size:12px;">
        <div style="font-weight:900; color:#0f172a; margin-bottom:6px;">👤 بيانات العميل المشتري (طالب التمويل):</div>
        <div style="display:grid; grid-template-columns:1.2fr 1fr 0.8fr; gap:8px; font-weight:700;">
          <div>الاسم: <span style="font-weight:900;">${escapeHtml(clientName)}</span></div>
          <div>الرقم القومي: <span style="font-family:monospace; font-weight:900;">${escapeHtml(clientNid)}</span></div>
          <div>الهاتف: <span style="font-family:monospace; font-weight:900;">${escapeHtml(clientPhone)}</span></div>
        </div>
      </div>

      <table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom:14px;">
        <thead>
          <tr style="background:#090d16; color:#ffffff;">
            <th style="padding:8px 10px; text-align:right; border:1px solid #090d16;">البيان والمواصفات الفنية للسيارة</th>
            <th style="padding:8px 10px; text-align:right; border:1px solid #090d16;">التفاصيل المعتمدة</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:7px 10px; border:1px solid #cbd5e1; font-weight:800; background:#f8fafc; width:32%;">ماركة وطراز السيارة</td>
            <td style="padding:7px 10px; border:1px solid #cbd5e1; font-weight:900; font-size:13px;">${escapeHtml(carTitle)}</td>
          </tr>
          <tr>
            <td style="padding:7px 10px; border:1px solid #cbd5e1; font-weight:800; background:#f8fafc;">سنة الصنع / الحالة الفنية</td>
            <td style="padding:7px 10px; border:1px solid #cbd5e1; font-weight:800;">موديل ${escapeHtml(carYear)} — ${escapeHtml(carPaint)} (عداد: ${carMileage} كم)</td>
          </tr>
          <tr>
            <td style="padding:7px 10px; border:1px solid #cbd5e1; font-weight:800; background:#f8fafc;">رقم الشاسيه (VIN)</td>
            <td style="padding:7px 10px; border:1px solid #cbd5e1; font-family:monospace; font-weight:800;">${escapeHtml(chassis)}</td>
          </tr>
          <tr>
            <td style="padding:7px 10px; border:1px solid #cbd5e1; font-weight:800; background:#f8fafc;">رقم الموتور / اللون والكماليات</td>
            <td style="padding:7px 10px; border:1px solid #cbd5e1; font-weight:700;">${escapeHtml(engineColor)}</td>
          </tr>
        </tbody>
      </table>

      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:14px;">
        <div style="border:2px solid #0f172a; border-radius:10px; padding:10px; text-align:center; background:#f8fafc;">
          <div style="font-size:11px; font-weight:800; color:#475569;">إجمالي سعر السيارة نقداً</div>
          <div style="font-size:16px; font-weight:900; color:#0f172a; margin-top:4px;">${total.toLocaleString('ar-EG')} ج.م</div>
        </div>
        <div style="border:2px solid #059669; border-radius:10px; padding:10px; text-align:center; background:#ecfdf5;">
          <div style="font-size:11px; font-weight:800; color:#065f46;">الدفعة المقدمة المسددة (${pct}%)</div>
          <div style="font-size:16px; font-weight:900; color:#047857; margin-top:4px;">${down.toLocaleString('ar-EG')} ج.م</div>
        </div>
        <div style="border:2px solid #d97706; border-radius:10px; padding:10px; text-align:center; background:#fffbeb;">
          <div style="font-size:11px; font-weight:800; color:#92400e;">صافي مبلغ التمويل المطلوب</div>
          <div style="font-size:16px; font-weight:900; color:#b45309; margin-top:4px;">${loan.toLocaleString('ar-EG')} ج.م</div>
        </div>
      </div>

      <div style="background:#f8fafc; border-right:4px solid #f59e0b; padding:9px 12px; font-size:11.5px; font-weight:700; color:#1e293b; margin-bottom:18px; line-height:1.7;">
        📌 <strong>إقرار المعرض:</strong> يقر <strong>${escapeHtml(DEALER_BRAND_NAME)}</strong> بتوافر السيارة المذكورة أعلاه وبصحة بياناتها الفنية، مع التزام المعرض بتسليم السيارة وإصدار عقد البيع النهائي وخطاب المرور فور إصدار الشيك البنكي أو أمر الدفع.<br/>
        <span>${escapeHtml(notes)}</span>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-top:20px; padding-top:12px; border-top:1px solid #cbd5e1; font-size:12px; font-weight:800; text-align:center;">
        <div>
          <div>توقيع المدير المسؤول (${escapeHtml(DEALER_BRAND_NAME)})</div>
          <div style="margin-top:32px; color:#64748b;">....................................................</div>
        </div>
        <div>
          <div>الختم الرسمي للمعرض</div>
          <div style="margin-top:32px; color:#64748b;">....................................................</div>
        </div>
      </div>
    </div>

    ${this.buildFooterHtml()}
  </div>
</body>
</html>`;

    this.printHtmlInIframe(fullHtml);
  }

  /**
   * Prints any active A4 modal (`#a4-preview-box` or `#printable-quote-area`) cleanly via hidden iframe.
   */
  static printCurrentModalA4() {
    const a4Box = document.getElementById('a4-preview-box');
    const quoteBox = document.getElementById('printable-quote-area');

    let contentHtml = '';
    if (a4Box) {
      if (window.AdminToolsUI && typeof AdminToolsUI.refreshDocPreview === 'function') {
        AdminToolsUI.refreshDocPreview();
      }
      contentHtml = `<div class="a4-sheet">${a4Box.innerHTML}</div>`;
    } else if (quoteBox) {
      const clone = quoteBox.cloneNode(true);
      clone.removeAttribute('id');
      clone.querySelectorAll('.no-print').forEach(el => el.remove());
      clone.className = (clone.className || '')
        .replace(/max-w-\S+/g, '')
        .replace(/max-h-\S+/g, '')
        .replace(/overflow-\S+/g, '');
      clone.style.cssText = 'width:100% !important; max-width:100% !important; max-height:none !important; overflow:visible !important; position:static !important; margin:0 auto !important; box-shadow:none !important; background:#ffffff !important; color:#0f172a !important; box-sizing:border-box !important;';
      contentHtml = clone.outerHTML;
    } else {
      window.print();
      return;
    }

    // Collect runtime Tailwind generated styles without dark-mode overrides
    let tailwindStyles = '';
    document.querySelectorAll('style').forEach(s => {
      const css = s.innerHTML || '';
      if (!css.includes('#printable-quote-area') && !css.includes('body.dark-mode')) {
        tailwindStyles += `<style>${css}</style>\n`;
      }
    });

    const fullHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>طباعة وثيقة رسمية A4 - ${escapeHtml(DEALER_BRAND_NAME)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  ${tailwindStyles}
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background: #ffffff !important;
      color: #0f172a !important;
      font-family: 'Cairo', Tahoma, Arial, sans-serif !important;
      font-size: 13px;
      line-height: 1.65;
      direction: rtl !important;
    }
    .print-container { width: 100%; max-width: 190mm; margin: 0 auto; padding: 2mm 0; }
    .no-print { display: none !important; }
    .a4-sheet {
      width: 100%;
      border: 3px solid #0f172a;
      border-radius: 14px;
      padding: 18px 22px;
      background: #ffffff;
    }
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }
    .doc-main-title { margin: 0; font-size: 21px; font-weight: 900; color: #0f172a; }
    .doc-sub { margin: 4px 0 0; font-size: 11.5px; font-weight: 700; color: #475569; }
    .doc-badge-wrap { text-align: left; }
    .doc-badge {
      background: #090d16;
      color: #f59e0b;
      font-weight: 900;
      font-size: 13.5px;
      padding: 6px 14px;
      border-radius: 8px;
      display: inline-block;
    }
    .doc-code { font-size: 11px; font-weight: 700; color: #475569; margin-top: 4px; }
    .doc-section {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 11px 14px;
      margin-bottom: 12px;
    }
    .doc-sec-title {
      font-size: 13.5px;
      font-weight: 900;
      color: #1e3a8a;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 5px;
      margin-bottom: 8px;
    }
    .doc-highlight-box {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 8px 12px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      font-size: 12.5px;
    }
    .doc-grid-1 { display: grid; grid-template-columns: 1fr; gap: 6px; }
    .doc-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 16px; }
    .doc-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px 12px; }
    .doc-terms { margin: 0; padding-right: 18px; }
    .doc-terms li { margin-bottom: 6px; text-align: justify; }
    .doc-signatures-3 {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
      margin-top: 24px;
      padding-top: 12px;
      border-top: 2px solid #0f172a;
      text-align: center;
      font-weight: 800;
    }
  </style>
</head>
<body>
  <div class="print-container">
    ${this.buildWatermarkHtml()}
    ${this.buildLetterheadHtml()}
    <div style="position:relative; z-index:1;">
      ${contentHtml}
    </div>
    ${this.buildFooterHtml()}
  </div>
</body>
</html>`;

    this.printHtmlInIframe(fullHtml);
  }
}

window.PrintEngine = PrintEngine;
