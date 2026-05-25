# Ticker Brief

Mobile-first stock research brief for AI infrastructure names.

Current build changes:
- Empty homepage is reduced to a Google-style title and search box.
- No default stock, ticker chips, API/provider cards, or explanatory homepage copy.
- Autocomplete suggestions appear only after the user starts typing.
- Local autocomplete now reads from `lib/data/symbols.ts` with 400+ common stocks, ETFs, and AI-infrastructure names.
- Unknown exact tickers can still be searched even when they are not in the local suggestion file.
- Results show compact company data, AI infrastructure score, bull/bear case, financial snapshot, and related tickers.
- FMP remains the only active live provider for V1.

## Local setup

```bash
npm install
npm run dev
```

## Environment variables

```bash
FMP_API_KEY=your_key_here
```

Fallback demo data is used when the FMP key is missing.
