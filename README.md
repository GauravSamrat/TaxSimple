# Income Tax Calculator (FY 2026-27)

A free, fast, and accurate income tax calculator for Indian taxpayers. Compare the Old Regime vs the New Regime side by side, see your exact tax liability, and get personalised tax-saving suggestions — all in your browser, with no sign-up and no data leaving your device.

**Live demo:** https://GauravSamrat/.github.io//

---

## Features

- **Old vs New Regime comparison** — see both calculations side by side and instantly know which saves you more.
- **Age-aware Old Regime slabs** — separate slabs for below 60, senior citizens (60–80), and super seniors (80+).
- **Deduction inputs** — Section 80C, 80D, 80CCD(1B) NPS, and home loan interest, all with the correct statutory caps applied automatically.
- **Section 87A rebate handling** — accurately zeroes out tax for eligible incomes under both regimes.
- **Surcharge and Health & Education Cess** — applied correctly based on income brackets and regime.
- **Tax-saving suggestions** — tailored tips based on your income, regime, and unused deduction headroom.
- **Export options** — download a PDF report, share on WhatsApp, or copy the full result to your clipboard.
- **No dependencies** — pure HTML, CSS, and vanilla JavaScript. No frameworks, no build step, no tracking.

---

## Tech Stack

- **HTML5** — semantic markup, all icons are inline SVG (no icon libraries, no emoji).
- **CSS3** — responsive layout, custom properties, clean modern aesthetic.
- **Vanilla JavaScript (ES6)** — all tax logic is hand-written and auditable in `script.js`.

No build tools, no npm, no bundler. Just three files.

---

## Tax Logic

All slabs, surcharge rates, and rebate rules are defined at the top of `script.js` in three clearly-named constants:

- `TAX_SLABS` — income slabs for the New Regime and all three Old Regime age brackets.
- `SURCHARGE_RATES` — surcharge brackets for both regimes.
- `applyRebate()` — Section 87A rebate logic for each regime.

Slabs reflect the Income Tax Act, 2025 and remain unchanged from FY 2025-26.

---

## Running Locally

Because there is no build step, you can run this in three ways:

**Option 1 — Just open the file:**
Double-click `index.html` in your file explorer. It will open in your default browser.

**Option 2 — Simple local server (recommended):**
If you have Python installed:

```bash
python3 -m http.server 8000
```
