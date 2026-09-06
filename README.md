# GemMetrics / CAGS 4C Advanced
### Institutional Colored Gemstone Valuation Engine & Appraisal Platform

GemMetrics (CAGS 4C Advanced) is an institutional-grade colored gemstone appraisal and market valuation platform. It combines algorithmic gemological pricing models calibrated to the GIA 4C grading standards with real-time market data ingestion, dynamic provenance and treatment factor matrices, and client-side luxury PDF appraisal certificate generation.

---

## Architecture Overview

The repository is structured as a modern multi-tiered application:

```
├── src/                         # Main Client Application (React 19 + TypeScript + Vite)
│   ├── engine/                  # Gemological Pricing Model & Species Catalog
│   │   ├── pricingModel.ts      # Core mathematical 4C valuation algorithms
│   │   └── speciesCatalog.ts    # Mineral groups, specific gravities, base prices
│   ├── components/              # UI Components (ColorPicker, GlassCard, PDF Export)
│   │   ├── ColorPicker.tsx      # GIA 3D Hue, Tone, and Saturation interactive selector
│   │   ├── GlassCard.tsx        # Liquid Glass morphism architectural container
│   │   ├── MarketComparables.tsx# Scraped listings & comparable transactions viewer
│   │   └── PdfExportButton.tsx  # 2-page luxury vector PDF appraisal generator
│   ├── services/                # Market data fetcher & comparable matching service
│   └── styles/                  # Apple fluid silk wallpaper & liquid glass styling
│
├── server/                      # Express Backend API & Market Database
│   ├── index.js                 # REST API endpoints (/api/market-prices, /api/valuation/calculate, /api/config)
│   ├── db/                      # SQLite persistence (market_data.sqlite)
│   ├── engine/                  # Server-side synced valuation engine & catalog
│   └── config/                  # Admin config overrides (config_overrides.json)
│
├── admin-dashboard/             # Standalone Administrator Control Panel (React + Vite)
│   ├── src/                     # Admin interface for editing base prices, origin factors,
│   │                            # treatment discounts, and system gross retail margins
│   └── public/
│
├── scripts/                     # Automated data scrapers & PDF batch generators
│   ├── cron_market_updater.cjs  # Daily FX & market clearinghouse scraper worker
│   └── generate_designed_pdf.cjs# Offline headless appraisal certificate renderer
│
└── public/                      # Static assets and cached daily market price registry
```

---

## Core Capabilities

### 1. GIA 4C Valuation Matrix
* **Carat Weight & Dimensions**: Accounts for non-linear carat rarity brackets and density/specific gravity formulas to cross-verify physical millimeter dimensions (L × W × H) against weight.
* **Color Science (Hue / Tone / Saturation)**: Continuous 3D GIA color sphere evaluation with automated detection of prestige trade color descriptors (*Royal Blue*, *Cornflower Blue*, *Pigeon's Blood*, *Vivid Colombian Green*, *Neon Electric Turquoise*).
* **Clarity & Optical Physics**: GIA colored stone types (Type I, II, III), eye-clean status, transparency, brilliance percentage, windowing leakage, and extinction black zones.
* **Cut & Proportions**: Polish and symmetry grading impact multipliers.

### 2. Provenance & Enhancement Matrices
* **Geographic Origin Factor**: Pre-calibrated regional multipliers (e.g., Kashmir, Burma Mogok, Ceylon, Colombia Muzo, Brazil Batalha).
* **Treatment & Enhancement Status**: Differentiates untreated natural gems, customary standard heat, oiling (minor/moderate/significant), beryllium diffusion, irradiation, and glass filling.
* **Laboratory Accreditation**: Dynamic multipliers for Tier 1 international laboratories (GIA, SSEF, Gübelin) vs. domestic accredited labs vs. uncertified specimens.

### 3. Luxury 2-Page Appraisal Certificate Export
* Generates vector-sharp, print-ready A4 appraisal certificates directly in the browser via `jspdf`.
* Features gold border framing, certificate tracking serials (`GM-XXXXXXXX`), security rosette corners, specimen specification tables, and methodology disclaimers.

### 4. Admin Management Dashboard
* Dedicated control panel to inspect SQLite market prices, apply manual price overrides, adjust origin/treatment factors, and set default retail markup percentages.

---

## Quick Start & Local Development

### Prerequisites
* Node.js 18+
* npm or pnpm

### 1. Backend Service
```bash
cd server
npm install
node index.js
```
*Backend runs on `http://localhost:3001`.*

### 2. Main Appraisal Application
```bash
# In the root directory:
npm install
npm run dev
```
*Main application runs on `http://localhost:5173`.*

### 3. Admin Dashboard (Optional)
```bash
cd admin-dashboard
npm install
npm run dev
```
*Admin panel runs on `http://localhost:5174`.*

---

## Scripts & Tools
* **Market Data Worker**: `npm run cron:update` runs the foreign exchange and verified market listings updater.
* **Verification Suite**: `node verify_app.cjs` runs automated Playwright verification of dark/light themes, preset switches, and PDF downloads.

---

## License
ISC License.
