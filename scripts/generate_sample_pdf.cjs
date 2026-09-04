const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

const OUTPUT_PDF = path.join('C:\\Users\\Lakshan\\.gemini\\antigravity-ide\\brain\\355c3413-1b43-4337-91e5-5baf9d3deb68', 'Sample_GemMetrics_Appraisal_Report.pdf');

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4'
});

const certId = 'GM-94021588';
const dateStr = 'September 4, 2026';
const margin = 18;
const pageWidth = 210;
const contentWidth = pageWidth - margin * 2;

// =========================================================================
// PAGE 1: OFFICIAL VALUATION CERTIFICATE & PRICING APPRAISAL
// =========================================================================

// Luxury Midnight Header Banner
doc.setFillColor(11, 19, 43); // Deep Midnight Slate
doc.rect(0, 0, pageWidth, 42, 'F');

// Champagne Gold Accent Stripe
doc.setFillColor(212, 175, 55); // Classic Gold
doc.rect(0, 42, pageWidth, 1.8, 'F');

// Header Brand Text
doc.setTextColor(255, 255, 255);
doc.setFont('helvetica', 'bold');
doc.setFontSize(18);
doc.text('GEMMETRICS INSTITUTE OF VALUATION', margin, 18);

doc.setFontSize(8.5);
doc.setFont('helvetica', 'normal');
doc.setTextColor(203, 213, 225);
doc.text('OFFICIAL 4C COLORED GEMSTONE APPRAISAL & MARKET VALUATION CERTIFICATE', margin, 25);

// Certificate Identification & Security Meta
doc.setFontSize(7.5);
doc.setTextColor(148, 163, 184);
doc.text(`REPORT REF: ${certId}   |   DATE: ${dateStr.toUpperCase()}   |   STANDARDS: GIA / GEMGUIDE`, margin, 34);

// Decorative Security Badge in Header Right
doc.setDrawColor(212, 175, 55);
doc.setFillColor(15, 27, 60);
doc.roundedRect(pageWidth - margin - 42, 11, 42, 22, 2, 2, 'FD');
doc.setFontSize(7);
doc.setFont('helvetica', 'bold');
doc.setTextColor(212, 175, 55);
doc.text('CERTIFIED AUDIT', pageWidth - margin - 38, 18);
doc.setFont('helvetica', 'normal');
doc.setTextColor(255, 255, 255);
doc.setFontSize(6.5);
doc.text('ISO-ALIGNED 4C ENGINE', pageWidth - margin - 38, 23);
doc.text('CURRENCY: USD ($1.00)', pageWidth - margin - 38, 28);

// -------------------------------------------------------------------------
// SECTION 1: SPECIMEN IDENTITY & OPTICAL PROFILE (Two Side-by-Side Cards)
// -------------------------------------------------------------------------
let currentY = 50;
const cardWidth = (contentWidth - 6) / 2;
const cardHeight = 58;

// Card 1: Physical Identity & Origin
doc.setFillColor(248, 250, 252);
doc.setDrawColor(226, 232, 240);
doc.roundedRect(margin, currentY, cardWidth, cardHeight, 3, 3, 'FD');

doc.setFillColor(238, 242, 246);
doc.roundedRect(margin, currentY, cardWidth, 9, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(15, 23, 42);
doc.text('1. GEMOLOGICAL IDENTITY & PROVENANCE', margin + 4, currentY + 6.5);

let itemY = currentY + 16;
doc.setFontSize(8);

const renderRow = (label, val, x, y) => {
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text(label, x, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(val, x + 30, y);
};

renderRow('Species:', 'Blue Sapphire', margin + 4, itemY);
itemY += 7;
renderRow('Mineral Group:', 'Corundum', margin + 4, itemY);
itemY += 7;
renderRow('Carat Weight:', '3.50 Carats', margin + 4, itemY);
itemY += 7;
renderRow('Origin Locality:', 'Sri Lanka (Ceylon)', margin + 4, itemY);
itemY += 7;
renderRow('Enhancement:', 'Standard Heat (Permanent)', margin + 4, itemY);
itemY += 7;
renderRow('Dimensions:', '9.80 × 7.60 × 5.20 mm', margin + 4, itemY);

// Card 2: 4C Optical & Visual Grading
const card2X = margin + cardWidth + 6;
doc.setFillColor(248, 250, 252);
doc.setDrawColor(226, 232, 240);
doc.roundedRect(card2X, currentY, cardWidth, cardHeight, 3, 3, 'FD');

doc.setFillColor(238, 242, 246);
doc.roundedRect(card2X, currentY, cardWidth, 9, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(15, 23, 42);
doc.text('2. 4C OPTICAL & CLARITY EVALUATION', card2X + 4, currentY + 6.5);

itemY = currentY + 16;
renderRow('Color Tone:', '70% (GIA Depth of Tone)', card2X + 4, itemY);
itemY += 7;
renderRow('Saturation:', '80% (Spectral Purity)', card2X + 4, itemY);
itemY += 7;
renderRow('Clarity Grade:', 'LI (Eye-Clean Type II)', card2X + 4, itemY);
itemY += 7;
renderRow('Brilliance:', '85% Light Return', card2X + 4, itemY);
itemY += 7;
renderRow('Optics/Window:', 'Window 5% · Extinction 10%', card2X + 4, itemY);
itemY += 7;
renderRow('Finish / Polish:', 'VERY GOOD / EXCELLENT', card2X + 4, itemY);

currentY += cardHeight + 8;

// -------------------------------------------------------------------------
// SECTION 2: DUAL VALUATION BENCHMARK (Wholesale Trade vs Retail Appraisal)
// -------------------------------------------------------------------------
doc.setFillColor(15, 23, 42);
doc.roundedRect(margin, currentY, contentWidth, 72, 3, 3, 'F');

doc.setFillColor(56, 189, 248);
doc.rect(margin, currentY, contentWidth, 1.2, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(56, 189, 248);
doc.text(
  'OFFICIAL APPRAISAL CLASSIFICATION: FINE TRADE QUALITY (SCORE: 81 / 100)',
  margin + 8,
  currentY + 10
);

const valColWidth = (contentWidth - 24) / 2;
const leftColX = margin + 8;

doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(148, 163, 184);
doc.text('INDICATIVE WHOLESALE TRADE RANGE (B2B)', leftColX, currentY + 20);

doc.setFontSize(16);
doc.setTextColor(255, 255, 255);
doc.text('$14,861  –  $18,914', leftColX, currentY + 28);

doc.setFontSize(8.5);
doc.setTextColor(56, 189, 248);
doc.text('Per-Carat Range: $4,246 – $5,404 /ct', leftColX, currentY + 34);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(203, 213, 225);
doc.text('Statistical Midpoint: $16,888 ($4,825/ct)', leftColX, currentY + 41);

const wholesaleDesc = 'Wholesale cost basis traded between accredited gem merchants, cutters, and bourses. This serves as the benchmark for cash liquidity, private sales, and fair dealer acquisition.';
const splitWholesaleDesc = doc.splitTextToSize(wholesaleDesc, valColWidth);
doc.setFontSize(6.8);
doc.setTextColor(148, 163, 184);
doc.text(splitWholesaleDesc, leftColX, currentY + 48);

// Divider Line
const divX = margin + contentWidth / 2;
doc.setDrawColor(51, 65, 85);
doc.setLineWidth(0.5);
doc.line(divX, currentY + 15, divX, currentY + 66);

// RIGHT COLUMN: Retail Replacement Value
const rightColX = divX + 8;
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(245, 158, 11);
doc.text('ESTIMATED RETAIL REPLACEMENT VALUE', rightColX, currentY + 20);

doc.setFontSize(16);
doc.setTextColor(255, 255, 255);
doc.text('$22,292  –  $28,371', rightColX, currentY + 28);

doc.setFontSize(8.5);
doc.setTextColor(245, 158, 11);
doc.text('Benchmark Midpoint: $25,332 ($7,238/ct)', rightColX, currentY + 34);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(203, 213, 225);
doc.text('Recommended Insurance Schedule: $25,332', rightColX, currentY + 41);

const retailDesc = 'Full retail replacement appraisal for insurance coverage and retail boutique purchase. Reflects customary retail gross margins (+50%), certification overhead, and custom jewelry mounting costs.';
const splitRetailDesc = doc.splitTextToSize(retailDesc, valColWidth);
doc.setFontSize(6.8);
doc.setTextColor(148, 163, 184);
doc.text(splitRetailDesc, rightColX, currentY + 48);

currentY += 78;

// -------------------------------------------------------------------------
// SECTION 3: PLAIN-ENGLISH VALUATION RATIONALE
// -------------------------------------------------------------------------
doc.setFillColor(248, 250, 252);
doc.setDrawColor(226, 232, 240);
doc.roundedRect(margin, currentY, contentWidth, 54, 3, 3, 'FD');

doc.setFillColor(238, 242, 246);
doc.roundedRect(margin, currentY, contentWidth, 9, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(15, 23, 42);
doc.text('3. APPRAISER VALUATION RATIONALE (WHAT DRIVES THIS SPECIMEN\'S VALUE)', margin + 6, currentY + 6.5);

let ratY = currentY + 15;
const renderBullet = (title, desc) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(2, 132, 199);
  doc.text(`•  ${title}:`, margin + 6, ratY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const split = doc.splitTextToSize(desc, contentWidth - 45);
  doc.text(split, margin + 42, ratY);
  ratY += 10;
};

renderBullet(
  'Color Optics',
  'Tone depth of 70% and saturation of 80% place the color in the upper tier for Blue Sapphire. High brilliance (85%) with low windowing (5%) prevents dull or washed-out appearance.'
);

renderBullet(
  'Weight Bracket',
  'At 3.50 carats, this gem falls in the 3.00 – 4.99 ct trade tier. Colored gemstone rarity increases non-linearly with weight, commanding a higher per-carat rate than smaller calibrated stones.'
);

renderBullet(
  'Enhancement & Origin',
  'The specimen is evaluated under Standard Heat (Permanent). Origin provenance is attributed to Sri Lanka (Ceylon), backed by Tier 1 Global Lab (GIA/SSEF/Gübelin).'
);

// Page 1 Footer
doc.setFontSize(7);
doc.setTextColor(148, 163, 184);
doc.text(
  'NOTICE: Algorithmic valuation synthesized under GIA 4C & GemGuide standards. See Page 2 for live trade references.',
  margin,
  286
);
doc.text('PAGE 1 OF 2', pageWidth - margin - 18, 286);

// =========================================================================
// PAGE 2: VERIFIED MARKET COMPARABLES & PRACTICAL ADVISORY
// =========================================================================
doc.addPage();

doc.setFillColor(15, 23, 42);
doc.rect(0, 0, pageWidth, 28, 'F');
doc.setFillColor(212, 175, 55);
doc.rect(0, 28, pageWidth, 1.2, 'F');

doc.setTextColor(255, 255, 255);
doc.setFont('helvetica', 'bold');
doc.setFontSize(14);
doc.text('REFERRING MARKET COMPARABLES & SCRAPED SOURCES', margin, 14);

doc.setFontSize(8);
doc.setFont('helvetica', 'normal');
doc.setTextColor(203, 213, 225);
doc.text('EMPIRICAL GROUND-TRUTH: ACTUAL ACTIVE LISTINGS SCRAPED FROM VERIFIED DEALERS', margin, 21);

let p2Y = 38;

// Statistical Summary Box
doc.setFillColor(241, 245, 249);
doc.setDrawColor(203, 213, 225);
doc.roundedRect(margin, p2Y, contentWidth, 22, 2, 2, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(15, 23, 42);
doc.text('SCRAPED MARKET BENCHMARK SUMMARY (NEARBY CARAT WEIGHTS)', margin + 6, p2Y + 6);

doc.setFontSize(7.5);
doc.setFont('helvetica', 'normal');
doc.setTextColor(71, 85, 105);

doc.text('Active Scraped Listings Indexed: 10 specimens', margin + 6, p2Y + 12);
doc.text('Scraped Market Median: $4,375 /ct', margin + 65, p2Y + 12);
doc.text('Market Spread: $1,480 – $7,750 /ct', margin + 120, p2Y + 12);

doc.setFontSize(7);
doc.setTextColor(2, 132, 199);
doc.text(
  '* Algorithmic Midpoint ($4,825/ct) strongly correlates with verified inventory on accredited platforms.',
  margin + 6,
  p2Y + 18
);

p2Y += 28;

// Comparables Table
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(15, 23, 42);
doc.text('4. REAL-WORLD COMPARABLE INVENTORY (REFERRING PUBLIC SOURCES)', margin, p2Y);
p2Y += 5;

// Table Header Row
doc.setFillColor(15, 23, 42);
doc.rect(margin, p2Y, contentWidth, 7.5, 'F');
doc.setTextColor(255, 255, 255);
doc.setFontSize(7.5);
doc.setFont('helvetica', 'bold');

doc.text('SPECIMEN / LISTING TITLE', margin + 3, p2Y + 5);
doc.text('CARAT', margin + 78, p2Y + 5);
doc.text('PRICE / CT', margin + 96, p2Y + 5);
doc.text('TOTAL PRICE', margin + 120, p2Y + 5);
doc.text('REFERRING SOURCE', margin + 144, p2Y + 5);

p2Y += 7.5;

const sampleComparables = [
  {
    title: '3.54 Ct. Cushion Cut Ceylon Blue Sapphire',
    carat: 3.54,
    pricePerCarat: 4950,
    priceUsd: 17523,
    sourceName: 'The Natural Sapphire Company'
  },
  {
    title: '3.38 Ct. Oval Cut Ceylon Blue Sapphire',
    carat: 3.38,
    pricePerCarat: 1480,
    priceUsd: 5002,
    sourceName: 'The Natural Sapphire Company'
  },
  {
    title: '3.80 Ct. Royal Blue Ceylon Sapphire',
    carat: 3.80,
    pricePerCarat: 3800,
    priceUsd: 14440,
    sourceName: 'GemRockAuctions'
  },
  {
    title: '3.25 Ct. Certified Unheated Ceylon Sapphire',
    carat: 3.25,
    pricePerCarat: 5600,
    priceUsd: 18200,
    sourceName: 'GemPundit'
  },
  {
    title: '4.00 Ct. Emerald Cut Ceylon Blue Sapphire',
    carat: 4.00,
    pricePerCarat: 7750,
    priceUsd: 31000,
    sourceName: 'The Natural Sapphire Company'
  }
];

sampleComparables.forEach((item, idx) => {
  const rowBg = idx % 2 === 0 ? 255 : 248;
  doc.setFillColor(rowBg, rowBg, rowBg);
  doc.rect(margin, p2Y, contentWidth, 10, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, p2Y + 10, margin + contentWidth, p2Y + 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(15, 23, 42);
  const titleTrimmed = doc.splitTextToSize(item.title, 72)[0] || item.title;
  doc.text(titleTrimmed, margin + 3, p2Y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Verified Dealer Listing · Direct Web Source', margin + 3, p2Y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`${item.carat.toFixed(2)} ct`, margin + 78, p2Y + 6);
  doc.text(`$${item.pricePerCarat.toLocaleString()}`, margin + 96, p2Y + 6);
  doc.text(`$${item.priceUsd.toLocaleString()}`, margin + 120, p2Y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(2, 132, 199);
  doc.text(item.sourceName, margin + 144, p2Y + 6);

  p2Y += 10;
});

p2Y += 8;

// -------------------------------------------------------------------------
// SECTION 5: PRACTICAL CONSUMER ADVISORY
// -------------------------------------------------------------------------
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(15, 23, 42);
doc.text('5. PRACTICAL ADVISORY FOR BUYERS, SELLERS & APPRAISALS', margin, p2Y);
p2Y += 5;

const advCardWidth = (contentWidth - 6) / 2;
const advCardHeight = 60;

// Box A: Guidance for Buyers
doc.setFillColor(248, 250, 252);
doc.setDrawColor(226, 232, 240);
doc.roundedRect(margin, p2Y, advCardWidth, advCardHeight, 2, 2, 'FD');

doc.setFillColor(238, 242, 246);
doc.roundedRect(margin, p2Y, advCardWidth, 8, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(15, 23, 42);
doc.text('ADVISORY: PURCHASING OR VERIFYING ASKING PRICES', margin + 4, p2Y + 5.5);

let advY = p2Y + 13;
const buyerPoints = [
  '1. Lab Report Requirement: Never purchase high-value colored stones without an accredited third-party laboratory report (GIA, SSEF, Gübelin, or AGL).',
  '2. Target Fair Price: In secondary or private transactions, you should never pay full retail appraisal value. Aim between the wholesale midpoint and retail minimum.',
  '3. Inspect Windowing: Ensure the pavilion is not cut too shallow merely to preserve carat weight, which causes light leakage (read-through effect).'
];

buyerPoints.forEach(pt => {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  const split = doc.splitTextToSize(pt, advCardWidth - 8);
  doc.text(split, margin + 4, advY);
  advY += 14;
});

// Box B: Guidance for Sellers & Insurance
const advBox2X = margin + advCardWidth + 6;
doc.setFillColor(248, 250, 252);
doc.setDrawColor(226, 232, 240);
doc.roundedRect(advBox2X, p2Y, advCardWidth, advCardHeight, 2, 2, 'FD');

doc.setFillColor(238, 242, 246);
doc.roundedRect(advBox2X, p2Y, advCardWidth, 8, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(15, 23, 42);
doc.text('ADVISORY: SELLING, TRADING, OR INSURING', advBox2X + 4, p2Y + 5.5);

advY = p2Y + 13;
const sellerPoints = [
  '1. Insurance Replacement Schedule: Submit the Estimated Retail Replacement Value to your insurance underwriter for appropriate coverage in the event of loss or theft.',
  '2. Liquidation Realities: When selling to gemstone dealers, pawnbrokers, or auction houses, expect bids within the Indicative Wholesale Trade Range.',
  '3. Treatment Full Disclosure: In accordance with FTC and CIBJO regulations, all heat, oil, or clarity enhancements must be formally disclosed to prospective buyers.'
];

sellerPoints.forEach(pt => {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  const split = doc.splitTextToSize(pt, advCardWidth - 8);
  doc.text(split, advBox2X + 4, advY);
  advY += 14;
});

p2Y += advCardHeight + 8;

// Certification Signature & Standards Seal Block
doc.setFillColor(241, 245, 249);
doc.setDrawColor(203, 213, 225);
doc.roundedRect(margin, p2Y, contentWidth, 22, 2, 2, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(15, 23, 42);
doc.text('FORMAL APPRAISAL COMPLIANCE & ACCREDITATION SEAL', margin + 6, p2Y + 6);

doc.setFont('helvetica', 'normal');
doc.setFontSize(6.8);
doc.setTextColor(100, 116, 139);
const legalText = 'This appraisal document has been algorithmically synthesized in conformity with the Uniform Standards of Professional Appraisal Practice (USPAP), GIA Color Science (31-Hue Munsell System), and the GemGuide 2D Quality Matrix. Data sources include verified live dealer inventories (The Natural Sapphire Company, Emeralds.com, The Natural Ruby Company, GemRockAuctions, GemPundit).';
const splitLegal = doc.splitTextToSize(legalText, contentWidth - 12);
doc.text(splitLegal, margin + 6, p2Y + 11);

// Page 2 Footer
doc.setFontSize(7);
doc.setTextColor(148, 163, 184);
doc.text(`GEMMETRICS INSTITUTE OF VALUATION   |   OFFICIAL REPORT #${certId}   |   ALL RIGHTS RESERVED`, margin, 286);
doc.text('PAGE 2 OF 2', pageWidth - margin - 18, 286);

// Save to disk
const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
fs.writeFileSync(OUTPUT_PDF, pdfBuffer);
console.log('✅ Generated sample PDF at:', OUTPUT_PDF);
console.log('   File size:', (pdfBuffer.length / 1024).toFixed(1), 'KB');
