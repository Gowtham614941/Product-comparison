# OmniSpec &mdash; Enterprise Multi-Category Specification & Price Intelligence Engine

[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20RLS-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

OmniSpec is an enterprise-grade multi-category product specification matrix and real-time market pricing intelligence engine. It allows consumers and professionals to compare products side-by-side with algorithmic multi-attribute utility scoring, historical price volatility analytics, and multi-retailer arbitrage discovery.

---

## Key Features

1. **Category-Agnostic Specification Engine**:
   - Attribute definitions are defined dynamically in PostgreSQL (`categories.spec_defs` JSONB).
   - Fully supports `number` (directional scaling), `bool` (boolean parity), and `text` (categorical) specs.
   - New categories (e.g., Smartphones, Laptops, Audio, Drones, Appliances) require zero application code modifications.

2. **Algorithmic Multi-Attribute Utility Scoring (MAUT)**:
   - Specification attributes are normalized to $0&ndash;100$ utility vectors with directional polarity (higher-is-better vs lower-is-better).
   - Generates three distinct comparative verdicts:
     - **Best Overall Specs**: Product maximizing the user-weighted performance utility function.
     - **Best Value for Money**: Quantitative quotient of utility performance delivered per currency unit.
     - **Lowest Absolute Price**: Minimum price across indexed retailers.

3. **Custom Importance Weights**:
   - Granular per-spec sliders: **Ignore (0x)**, **Normal (1.0x)**, **High (1.75x)**, and **Top Priority (2.5x)**.
   - Adjusting weights recalculates utility vectors and verdict badges in real time with fluid micro-interactions.

4. **Differences Only Filter**:
   - Isolates divergence points by smoothly collapsing and hiding identical specification rows across compared items.

5. **Historical Price Trend Analytics**:
   - Interactive SVG Sparkline with hoverable cursor tooltips, historical minimum/maximum price points, and trend direction.
   - Automated PostgreSQL triggers log price deltas to `price_history` on every store price change.

6. **Market Timing "Buy or Wait" Oracle**:
   - Evaluates current minimum price against historical rolling averages and all-time minimums:
     - **Strong Buy**: Price is within 2% of the historical recorded low.
     - **Wait to Buy**: Price is $>5\%$ above historical average.
     - **Fair Market Price**: Price is within expected standard distribution.

7. **Multi-Retailer Price Tracking**:
   - Live price comparison across stores (e.g. Amazon, Best Buy, Walmart, B&H) with direct external links and lowest retailer callout.

8. **Shareable Matrix State & URL Serialization**:
   - Serializes selected products and user weight configurations into URL query parameters (`?c=id1,id2,id3&w=...`).
   - One-click shareable link copy with toast feedback.

9. **Price Drop Watchdog Alerts**:
   - Passwordless magic-link authentication via Supabase Auth.
   - Target price slider with projected savings calculation.
   - Serverless Edge Function (`supabase/functions/check-alerts`) evaluating alerts and dispatching transactional emails via Resend.

10. **Live Price Ingestion Script**:
    - High-throughput Node.js script (`scripts/ingest.mjs`) for bulk batch ingestion of retailer feeds.

---

## Architecture & Project Structure

```
d:/Product-comparison/
├── index.html                           # Application entry HTML with SEO meta tags
├── package.json                         # Dependencies & scripts
├── vite.config.js                       # Vite build configuration
├── .env.example                         # Environment variable template
├── supabase/
│   ├── schema.sql                       # Complete PostgreSQL schema, triggers, and RLS policies
│   └── functions/
│       └── check-alerts/
│           └── index.ts                 # Serverless Edge Function for email notifications
├── scripts/
│   ├── ingest.mjs                       # Bulk store price ingestion script
│   └── prices.json.example              # Sample ingestion JSON feed format
└── src/
    ├── main.jsx                         # React entrypoint
    ├── App.jsx                          # Main application orchestrator
    ├── index.css                        # Vanilla CSS design system (Obsidian/Slate theme)
    ├── lib/
    │   ├── supabase.js                  # Supabase client & connection diagnostics
    │   ├── scoring.js                   # MAUT algorithmic scoring & Market Oracle
    │   ├── urlState.js                  # URL query parameter serialization engine
    │   └── comparisonUtils.js           # Spec formatters, CSV export, diff detection
    ├── hooks/
    │   ├── useCatalog.js                # Live Supabase catalog fetching & filtering
    │   └── useAuth.js                   # Supabase authentication & alert management
    └── components/
        ├── Navbar.jsx                   # Navigation, view switcher & connection indicator
        ├── CatalogView.jsx              # Category tabs, search, filter, and product cards
        ├── ProductCard.jsx              # Product card with spec preview & compare toggle
        ├── ProductImage.jsx             # Adaptive image renderer with fallback placeholder
        ├── FloatingDock.jsx             # Sticky bottom drawer (1 to 4 products)
        ├── ComparisonMatrix.jsx         # Master comparison view
        ├── VerdictBanner.jsx            # Best Specs, Best Value, Lowest Price verdicts
        ├── WeightAdjuster.jsx           # Per-spec priority sliders
        ├── CompareTable.jsx             # Sticky side-by-side comparative table
        ├── Sparkline.jsx                # Interactive SVG historical trendline
        ├── MarketOracleBadge.jsx        # Buy or Wait quantitative indicator
        ├── StorePricesTable.jsx         # Store prices with links & lowest retailer tag
        ├── PriceAlertModal.jsx          # Target price drop alert modal
        ├── UserAlertsDrawer.jsx         # Drawer displaying user's active tracked alerts
        ├── ConnectionStatusModal.jsx    # Real-time Supabase connection diagnostics
        └── ToastContainer.jsx           # Modern animated feedback toasts
```

---

## Supabase Connection & Setup Guide

### 1. Execute Database Schema
Open your [Supabase Dashboard](https://supabase.com/dashboard) &rarr; **SQL Editor** &rarr; New Query. Paste and run the contents of [`supabase/schema.sql`](supabase/schema.sql).

This provisions:
- `categories`, `products`, `store_prices`, `price_history`, and `price_alerts` tables.
- The `trg_store_price_history` PostgreSQL trigger for automated price history logging.
- Row-Level Security (RLS) policies isolating user price alerts.

### 2. Configure Environment Variables
Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-public-anon-key>

# Optional (for ingest script and edge functions):
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
RESEND_API_KEY=re_your_api_key_here
ALERT_FROM=alerts@omnispec.io
```

### 3. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:5173`. Click the **Database Status Pill** in the navigation bar to run an instant health check and verify table counts.

---

## Live Price Ingestion

To synchronize retailer prices into the database:

1. Create a `scripts/prices.json` file (see `scripts/prices.json.example`).
2. Run the ingestion script:

```bash
npm run ingest
```

The script performs conflict-safe upserts into `store_prices`. The PostgreSQL trigger automatically logs historical price changes into `price_history`.

---

## Production Build

```bash
npm run build
npm run preview
```
