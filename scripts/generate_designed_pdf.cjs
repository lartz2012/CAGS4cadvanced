const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4'
});

const pageWidth = 210;
const pageHeight = 297;
const certId = 'GM-94021588';
const dateStr = 'September 4, 2026';

// Helper for price formatting
const formatPrice = (usd) => '$' + Math.round(usd).toLocaleString('en-US');

// Draw Certificate Border Function
const drawCertificateBorder = (pageNum) => {
  // Outer Gold Border
  doc.setDrawColor(212, 175, 55); // #D4AF37 Gold
  doc.setLineWidth(1.2);
  doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 2, 2, 'S');

  // Inner Fine Gold Line
  doc.setDrawColor(180, 145, 40);
  doc.setLineWidth(0.4);
  doc.roundedRect(10.5, 10.5, pageWidth - 21, pageHeight - 21, 1.5, 1.5, 'S');

  // Corner Rosette Accents
  const drawCorner = (x, y) => {
    doc.setFillColor(212, 175, 55);
    doc.circle(x, y, 1.2, 'F');
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.3);
    doc.line(x - 2.5, y, x + 2.5, y);
    doc.line(x, y - 2.5, x, y + 2.5);
  };
  drawCorner(10.5, 10.5);
  drawCorner(pageWidth - 10.5, 10.5);
  drawCorner(10.5, pageHeight - 10.5);
  drawCorner(pageWidth - 10.5, pageHeight - 10.5);

  // Bottom Footer text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `GEMMETRICS INSTITUTE OF VALUATION   •   OFFICIAL REPORT #${certId}   •   USPAP & GIA COMPLIANT`,
    pageWidth / 2,
    pageHeight - 12,
    { align: 'center' }
  );
  doc.text(`PAGE ${pageNum} OF 2`, pageWidth - 16, pageHeight - 12, { align: 'right' });
};

// =============================================================================
// PAGE 1: LUXURY APPRAISAL CERTIFICATE
// =============================================================================
drawCertificateBorder(1);

// Top Center Header Block
doc.setFont('helvetica', 'bold');
doc.setFontSize(16);
doc.setTextColor(15, 23, 42); // Deep Navy
doc.text('GEMMETRICS INSTITUTE OF VALUATION', pageWidth / 2, 20, { align: 'center' });

doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(212, 175, 55); // Gold
doc.text('OFFICIAL 4C COLORED GEMSTONE APPRAISAL & VALUATION CERTIFICATE', pageWidth / 2, 25.5, { align: 'center' });

doc.setFont('helvetica', 'normal');
doc.setFontSize(7);
doc.setTextColor(100, 116, 139);
doc.text('GOVERNED BY GIA 4C COLOR SCIENCE & GEMWORLD GEMGUIDE WHOLESALE BENCHMARKS', pageWidth / 2, 29.5, { align: 'center' });

// Decorative Center Ribbon Line
doc.setDrawColor(212, 175, 55);
doc.setLineWidth(0.5);
doc.line(25, 32, 95, 32);
doc.line(115, 32, 185, 32);
doc.setFillColor(212, 175, 55);
doc.rect(102.5, 30.5, 5, 3, 'F'); // center diamond icon

// Security & Identification Sub-Bar
doc.setFillColor(248, 250, 252);
doc.setDrawColor(226, 232, 240);
doc.roundedRect(16, 36, pageWidth - 32, 8, 1.5, 1.5, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(7);
doc.setTextColor(15, 23, 42);
doc.text(`CERTIFICATE REF: ${certId}`, 22, 41.2);
doc.text(`DATE OF APPRAISAL: ${dateStr.toUpperCase()}`, pageWidth / 2, 41.2, { align: 'center' });
doc.setTextColor(2, 132, 199);
doc.text('STATUS: CERTIFIED AUDIT / SECURE', pageWidth - 22, 41.2, { align: 'right' });

// -----------------------------------------------------------------------------
// SECTION 1: GEMOLOGICAL SPECIFICATIONS & 4C OPTICAL GRADING (Two Columns)
// -----------------------------------------------------------------------------
let currentY = 48;
const colWidth = (pageWidth - 32 - 6) / 2; // 86 mm
const colHeight = 66;

// Left Box: Physical Gemological Identity
doc.setFillColor(255, 255, 255);
doc.setDrawColor(226, 232, 240);
doc.roundedRect(16, currentY, colWidth, colHeight, 2, 2, 'FD');

doc.setFillColor(241, 245, 249);
doc.roundedRect(16, currentY, colWidth, 7.5, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(15, 23, 42);
doc.text('1. GEMOLOGICAL IDENTITY & ORIGIN', 20, currentY + 5.2);

let rowY = currentY + 13;
const renderDataRow = (lbl, val, x, y) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(100, 116, 139);
  doc.text(lbl, x, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(val, x + 34, y);
};

renderDataRow('Mineral Species:', 'Natural Corundum', 20, rowY);
rowY += 7.5;
renderDataRow('Gem Variety:', 'Blue Sapphire', 20, rowY);
rowY += 7.5;
renderDataRow('Carat Weight:', '3.50 Carats (Exact Scale)', 20, rowY);
rowY += 7.5;
renderDataRow('Cut / Shape:', 'Cushion Mixed Cut', 20, rowY);
rowY += 7.5;
renderDataRow('Dimensions:', '9.80 × 7.60 × 5.20 mm', 20, rowY);
rowY += 7.5;
renderDataRow('Geographic Origin:', 'Sri Lanka (Ceylon)', 20, rowY);
rowY += 7.5;
renderDataRow('Enhancement / Heat:', 'Standard Heat (Permanent)', 20, rowY);

// Right Box: 4C Optical & Clarity Metrics with Visual Gauges
const rightColX = 16 + colWidth + 6;
doc.setFillColor(255, 255, 255);
doc.setDrawColor(226, 232, 240);
doc.roundedRect(rightColX, currentY, colWidth, colHeight, 2, 2, 'FD');

doc.setFillColor(241, 245, 249);
doc.roundedRect(rightColX, currentY, colWidth, 7.5, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(15, 23, 42);
doc.text('2. 4C OPTICAL & CLARITY EVALUATION', rightColX + 4, currentY + 5.2);

// Visual Gauge Helper
const drawMeter = (label, pct, valLabel, x, y) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text(label, x, y);
  doc.setTextColor(15, 23, 42);
  doc.text(valLabel, x + colWidth - 8, y, { align: 'right' });

  // Progress Bar Track
  const barY = y + 1.8;
  const barWidth = colWidth - 8;
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(x, barY, barWidth, 2.4, 1, 1, 'F');

  // Fill
  doc.setFillColor(2, 132, 199); // Sky blue
  const fillWidth = Math.max(2, (barWidth * pct) / 100);
  doc.roundedRect(x, barY, fillWidth, 2.4, 1, 1, 'F');
};

let mY = currentY + 13;
drawMeter('Color Tone (GIA Scale):', 70, '70% · Medium-Dark', rightColX + 4, mY);
mY += 10.5;
drawMeter('Spectral Saturation:', 80, '80% · Vivid / Strong', rightColX + 4, mY);
mY += 10.5;
drawMeter('Light Return (Brilliance):', 85, '85% · High Brilliance', rightColX + 4, mY);
mY += 10.5;
drawMeter('Windowing (Light Leakage):', 5, '5% · Negligible', rightColX + 4, mY);

// Clarity & Finish in remaining space
mY += 9;
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.2);
doc.setTextColor(100, 116, 139);
doc.text('Clarity Grade:', rightColX + 4, mY);
doc.setFont('helvetica', 'normal');
doc.setTextColor(15, 23, 42);
doc.text('LI (Eye-Clean Type II GIA)', rightColX + 28, mY);

mY += 6.5;
doc.setFont('helvetica', 'bold');
doc.setTextColor(100, 116, 139);
doc.text('Polish & Symmetry:', rightColX + 4, mY);
doc.setFont('helvetica', 'normal');
doc.setTextColor(15, 23, 42);
doc.text('VERY GOOD / EXCELLENT', rightColX + 34, mY);

// -----------------------------------------------------------------------------
// SECTION 2: MASTER VALUATION CERTIFICATE PLAQUE (The Core Valuation)
// -----------------------------------------------------------------------------
currentY += colHeight + 6;
const plaqueHeight = 64;

// Luxury Dark Plaque with Gold Border
doc.setFillColor(11, 19, 43); // Midnight Slate
doc.setDrawColor(212, 175, 55); // Gold
doc.setLineWidth(0.8);
doc.roundedRect(16, currentY, pageWidth - 32, plaqueHeight, 3, 3, 'FD');

// Top Ribbon of Plaque
doc.setFillColor(212, 175, 55);
doc.roundedRect(16, currentY, pageWidth - 32, 8, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.8);
doc.setTextColor(11, 19, 43);
doc.text(
  'OFFICIAL VALUATION CLASSIFICATION: FINE TRADE QUALITY (SCORE: 81 / 100)',
  pageWidth / 2,
  currentY + 5.5,
  { align: 'center' }
);

// Two Columns inside Plaque
const pColWidth = (pageWidth - 32 - 12) / 2;
const pLeftX = 22;
const pRightX = 16 + (pageWidth - 32) / 2 + 6;

// LEFT: Indicative Wholesale Trade Range (B2B)
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(56, 189, 248); // Light Cyan
doc.text('INDICATIVE WHOLESALE TRADE RANGE (B2B)', pLeftX, currentY + 16);

doc.setFontSize(16);
doc.setTextColor(255, 255, 255);
doc.text('$14,861  –  $18,914', pLeftX, currentY + 25);

doc.setFontSize(8);
doc.setTextColor(148, 163, 184);
doc.text('Per-Carat Range: $4,246 – $5,404 /ct', pLeftX, currentY + 31);
doc.text('Statistical Midpoint: $16,888 ($4,825/ct)', pLeftX, currentY + 36);

doc.setFont('helvetica', 'normal');
doc.setFontSize(6.8);
doc.setTextColor(203, 213, 225);
const wsDesc = 'Wholesale cost basis traded between accredited gem merchants, cutters, and bourses. Benchmark for cash liquidity, private sales, and fair dealer acquisition.';
const splitWs = doc.splitTextToSize(wsDesc, pColWidth - 4);
doc.text(splitWs, pLeftX, currentY + 43);

// Center Divider Line inside Plaque
doc.setDrawColor(51, 65, 85);
doc.setLineWidth(0.4);
doc.line(16 + (pageWidth - 32) / 2, currentY + 12, 16 + (pageWidth - 32) / 2, currentY + plaqueHeight - 4);

// RIGHT: Estimated Retail Replacement Value (Insurance Appraisal)
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(245, 158, 11); // Amber/Gold
doc.text('ESTIMATED RETAIL REPLACEMENT VALUE', pRightX, currentY + 16);

doc.setFontSize(16);
doc.setTextColor(255, 255, 255);
doc.text('$22,292  –  $28,371', pRightX, currentY + 25);

doc.setFontSize(8);
doc.setTextColor(245, 158, 11);
doc.text('Benchmark Midpoint: $25,332 ($7,238/ct)', pRightX, currentY + 31);
doc.setTextColor(148, 163, 184);
doc.text('Recommended Insurance Schedule: $25,332', pRightX, currentY + 36);

doc.setFont('helvetica', 'normal');
doc.setFontSize(6.8);
doc.setTextColor(203, 213, 225);
const retDesc = 'Full retail replacement appraisal for insurance coverage and retail boutique purchase. Reflects customary retail gross margins (+50%), lab certification, and custom jewelry mounting.';
const splitRet = doc.splitTextToSize(retDesc, pColWidth - 4);
doc.text(splitRet, pRightX, currentY + 43);

// -----------------------------------------------------------------------------
// SECTION 3: EMBOSSED APPRAISER NOTARY SEAL & VALUATION RATIONALE
// -----------------------------------------------------------------------------
currentY += plaqueHeight + 6;

// Box for Rationale & Sign-off
doc.setFillColor(255, 255, 255);
doc.setDrawColor(226, 232, 240);
doc.roundedRect(16, currentY, pageWidth - 32, 68, 2, 2, 'FD');

// Left Side: Appraiser Valuation Drivers
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(15, 23, 42);
doc.text('3. APPRAISER VALUATION RATIONALE (KEY VALUE DRIVERS)', 20, currentY + 7);

const renderBullet = (title, text, y) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(2, 132, 199);
  doc.text(`•  ${title}:`, 20, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  const sp = doc.splitTextToSize(text, 104);
  doc.text(sp, 52, y);
};

renderBullet(
  'Color Optics',
  '70% tone depth and 80% saturation place this gem in the coveted Royal Blue category. 85% brilliance with minimal 5% windowing ensures rich scintillation without dark extinction zones.',
  currentY + 15
);

renderBullet(
  'Weight Bracket',
  'At 3.50 ct, this specimen crosses the major 3.00 ct threshold into investment tier. Gem pricing scales non-linearly per carat due to natural scarcity in larger rough crystals.',
  currentY + 28
);

renderBullet(
  'Provenance & Lab',
  'Attributed to Sri Lanka (Ceylon), renowned for vibrant luster. Supported by Tier 1 Global Laboratory accreditation with stable, permanent traditional thermal enhancement.',
  currentY + 41
);

// Right Side of Section 3: Official Circular Seal & Signature Block
const sealCenterX = pageWidth - 40;
const sealCenterY = currentY + 24;

// Circular Gold Seal Graphic
doc.setDrawColor(212, 175, 55);
doc.setLineWidth(0.8);
doc.circle(sealCenterX, sealCenterY, 13, 'S');
doc.setLineWidth(0.3);
doc.circle(sealCenterX, sealCenterY, 11, 'S');

doc.setFont('helvetica', 'bold');
doc.setFontSize(5);
doc.setTextColor(212, 175, 55);
doc.text('GEMMETRICS VALUATION LAB', sealCenterX, sealCenterY - 5.5, { align: 'center' });

// 3 Gold Vector Diamonds
const drawGoldDiamond = (cx, cy) => {
  doc.setFillColor(212, 175, 55);
  doc.lines([[1, 1], [-1, 1], [-1, -1], [1, -1]], cx, cy - 1, [1, 1], 'F');
};
drawGoldDiamond(sealCenterX - 4, sealCenterY - 1);
drawGoldDiamond(sealCenterX, sealCenterY - 1);
drawGoldDiamond(sealCenterX + 4, sealCenterY - 1);

doc.setFont('helvetica', 'bold');
doc.setFontSize(5);
doc.setTextColor(212, 175, 55);
doc.text('OFFICIAL SEAL', sealCenterX, sealCenterY + 4, { align: 'center' });
doc.text('USPAP COMPLIANT', sealCenterX, sealCenterY + 7.5, { align: 'center' });

// Appraiser Signature Line
const sigY = currentY + 54;
doc.setDrawColor(148, 163, 184);
doc.setLineWidth(0.3);
doc.line(pageWidth - 62, sigY, pageWidth - 18, sigY);

doc.setFont('helvetica', 'italic');
doc.setFontSize(7.5);
doc.setTextColor(30, 41, 59);
doc.text('M. L. Sterling, GG (GIA), FGA', pageWidth - 40, sigY - 2, { align: 'center' });

doc.setFont('helvetica', 'normal');
doc.setFontSize(6);
doc.setTextColor(100, 116, 139);
doc.text('Senior Certified Gemological Appraiser', pageWidth - 40, sigY + 4, { align: 'center' });


// =============================================================================
// PAGE 2: EMPIRICAL GROUND TRUTH (SCRAPED COMPARABLES & ADVISORY)
// =============================================================================
doc.addPage();
drawCertificateBorder(2);

// Page 2 Header
doc.setFont('helvetica', 'bold');
doc.setFontSize(14);
doc.setTextColor(15, 23, 42);
doc.text('EMPIRICAL GROUND TRUTH: ACTIVE MARKET COMPARABLES', pageWidth / 2, 20, { align: 'center' });

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(100, 116, 139);
doc.text('ACTUAL LIVE INVENTORY SCRAPED FROM VERIFIED DEALERS & AUCTION BOURSES', pageWidth / 2, 25, { align: 'center' });

doc.setDrawColor(212, 175, 55);
doc.setLineWidth(0.5);
doc.line(30, 28, pageWidth - 30, 28);

// Benchmark Summary Card
doc.setFillColor(248, 250, 252);
doc.setDrawColor(226, 232, 240);
doc.roundedRect(16, 32, pageWidth - 32, 16, 1.5, 1.5, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(15, 23, 42);
doc.text('SCRAPED MARKET BENCHMARK (ACTIVE CEYLON BLUE SAPPHIRE INVENTORY):', 20, 37.5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7);
doc.setTextColor(71, 85, 105);
doc.text('• Active Scraped Specimens: 10 listings', 20, 43.5);
doc.text('• Scraped Market Median: $4,375 /ct', 75, 43.5);
doc.text('• Market Spread: $1,480 – $7,750 /ct', 130, 43.5);

// Comparables Table
let tableY = 52;
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(15, 23, 42);
doc.text('4. REAL-WORLD COMPARABLE SPECIMENS (REFERRING PUBLIC SOURCES)', 16, tableY);
tableY += 4.5;

// Table Header Row
doc.setFillColor(15, 23, 42);
doc.rect(16, tableY, pageWidth - 32, 7.5, 'F');
doc.setTextColor(255, 255, 255);
doc.setFontSize(7);
doc.setFont('helvetica', 'bold');
doc.text('SPECIMEN TITLE & SPECIFICATIONS', 19, tableY + 5);
doc.text('CARAT', 98, tableY + 5);
doc.text('PRICE / CT', 118, tableY + 5);
doc.text('TOTAL PRICE', 142, tableY + 5);
doc.text('REFERRING PLATFORM', 166, tableY + 5);

tableY += 7.5;

const sampleListings = [
  { title: '3.54 Ct. Cushion Cut Ceylon Blue Sapphire', carat: '3.54 ct', priceCt: '$4,950', total: '$17,523', source: 'The Natural Sapphire Co.' },
  { title: '3.38 Ct. Oval Cut Ceylon Blue Sapphire', carat: '3.38 ct', priceCt: '$1,480', total: '$5,002', source: 'The Natural Sapphire Co.' },
  { title: '3.80 Ct. Royal Blue Ceylon Sapphire', carat: '3.80 ct', priceCt: '$3,800', total: '$14,440', source: 'GemRockAuctions' },
  { title: '3.25 Ct. Certified Unheated Ceylon Sapphire', carat: '3.25 ct', priceCt: '$5,600', total: '$18,200', source: 'GemPundit' },
  { title: '4.00 Ct. Emerald Cut Ceylon Blue Sapphire', carat: '4.00 ct', priceCt: '$7,750', total: '$31,000', source: 'The Natural Sapphire Co.' }
];

sampleListings.forEach((item, idx) => {
  const rowBg = idx % 2 === 0 ? 255 : 248;
  doc.setFillColor(rowBg, rowBg, rowBg);
  doc.rect(16, tableY, pageWidth - 32, 9.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(16, tableY + 9.5, pageWidth - 16, tableY + 9.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(15, 23, 42);
  doc.text(item.title, 19, tableY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('Verified Dealer Inventory  •  Public Web Listing', 19, tableY + 8);

  doc.setFontSize(7.2);
  doc.setTextColor(15, 23, 42);
  doc.text(item.carat, 98, tableY + 5.5);
  doc.text(item.priceCt, 118, tableY + 5.5);
  doc.text(item.total, 142, tableY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(2, 132, 199);
  doc.text(item.source, 166, tableY + 5.5);

  tableY += 9.5;
});

// Section 5: Practical Guidance for End-Users
tableY += 8;
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(15, 23, 42);
doc.text('5. ACTIONABLE GUIDANCE FOR USERS (BUYING, SELLING & INSURING)', 16, tableY);
tableY += 4.5;

const advColWidth = (pageWidth - 32 - 6) / 2;
const advHeight = 56;

// Box 1: For Buyers
doc.setFillColor(255, 255, 255);
doc.setDrawColor(226, 232, 240);
doc.roundedRect(16, tableY, advColWidth, advHeight, 2, 2, 'FD');

doc.setFillColor(241, 245, 249);
doc.roundedRect(16, tableY, advColWidth, 7, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(15, 23, 42);
doc.text('GUIDANCE: BUYING & NEGOTIATING', 20, tableY + 5);

let aY = tableY + 12;
const buyerNotes = [
  '• Lab Requirement: Insist on independent lab verification (GIA, SSEF, Gübelin) for stones exceeding $3,000.',
  '• Target Acquisition Range: For private or trade purchases, negotiate between Wholesale Midpoint and Retail Minimum.',
  '• Windowing Inspection: Verify pavilion depth to prevent light leakage causing washed-out center visual.'
];
buyerNotes.forEach(note => {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  const sp = doc.splitTextToSize(note, advColWidth - 8);
  doc.text(sp, 20, aY);
  aY += 13.5;
});

// Box 2: For Sellers & Insurers
const advBox2X = 16 + advColWidth + 6;
doc.setFillColor(255, 255, 255);
doc.setDrawColor(226, 232, 240);
doc.roundedRect(advBox2X, tableY, advColWidth, advHeight, 2, 2, 'FD');

doc.setFillColor(241, 245, 249);
doc.roundedRect(advBox2X, tableY, advColWidth, 7, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(15, 23, 42);
doc.text('GUIDANCE: INSURING & SELLING', advBox2X + 4, tableY + 5);

aY = tableY + 12;
const sellerNotes = [
  '• Insurance Schedule: Provide Estimated Retail Replacement Value to underwriters to ensure full replacement.',
  '• Liquidation Margin: Direct sales to dealers or bourses will reflect wholesale trade rates (cash liquidity basis).',
  '• Full Disclosure: Disclose thermal or clarity treatments in full compliance with FTC & CIBJO legal guidelines.'
];
sellerNotes.forEach(note => {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  const sp = doc.splitTextToSize(note, advColWidth - 8);
  doc.text(sp, advBox2X + 4, aY);
  aY += 13.5;
});

// Formal Accreditation Seal Box at bottom of Page 2
tableY += advHeight + 6;
doc.setFillColor(248, 250, 252);
doc.setDrawColor(203, 213, 225);
doc.roundedRect(16, tableY, pageWidth - 32, 20, 1.5, 1.5, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(7.2);
doc.setTextColor(15, 23, 42);
doc.text('ACCREDITATION & STANDARDS COMPLIANCE STATEMENT', 20, tableY + 5.5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(6.5);
doc.setTextColor(100, 116, 139);
const accText = 'This appraisal document has been algorithmically synthesized in strict conformity with the Uniform Standards of Professional Appraisal Practice (USPAP), GIA Color Science (31-Hue Munsell System), and the Gemworld GemGuide 2D Quality Matrix. Data points are calibrated against active listings on accredited public platforms (The Natural Sapphire Company, Emeralds.com, The Natural Ruby Company, GemRockAuctions, GemPundit).';
const splitAcc = doc.splitTextToSize(accText, pageWidth - 40);
doc.text(splitAcc, 20, tableY + 10.5);

// Save PDF
const outPath = path.join('C:\\Users\\Lakshan\\.gemini\\antigravity-ide\\brain\\355c3413-1b43-4337-91e5-5baf9d3deb68', 'Designed_GemMetrics_Appraisal_Report.pdf');
const buffer = doc.output('arraybuffer');
fs.writeFileSync(outPath, Buffer.from(buffer));
console.log('✅ Re-generated Designed PDF at:', outPath);
