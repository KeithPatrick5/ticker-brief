# Ticker Brief

A compact Vercel-ready stock research dashboard for AI infrastructure investing.

## What it does

- One ticker/company search box
- Pulls live FMP data when `FMP_API_KEY` is set
- Shows valuation, cash flow, margins, debt, cash, AI infrastructure tags, bull case, bear case
- Includes provider fallback log for FMP, SEC, Finnhub, Alpha Vantage, and EODHD
- Falls back to demo data if keys are missing so the site still runs

## Vercel env vars

Start with only this:

```bash
FMP_API_KEY=your_key_here
```

Optional later:

```bash
FINNHUB_API_KEY=your_key_here
ALPHA_VANTAGE_API_KEY=your_key_here
EODHD_API_KEY=your_key_here
SEC_USER_AGENT="Ticker Brief contact@example.com"
```

## Local dev

```bash
npm install
npm run dev
```

## Deploy flow

1. Create GitHub repo
2. Push this project
3. Import repo into Vercel
4. Add env vars in Vercel Project Settings
5. Redeploy

## Notes

No `package-lock.json`, `node_modules`, `.next`, or `tsconfig.tsbuildinfo` should be committed.
