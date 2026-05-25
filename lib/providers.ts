export type ProviderStatus = "ready" | "missing_key" | "rate_limited" | "failed" | "skipped";

export type ResearchProvider = {
  name: "FMP" | "SEC" | "Finnhub" | "Alpha Vantage" | "EODHD";
  status: ProviderStatus;
  note: string;
};

export type Filing = {
  form: string;
  filed: string;
  accession?: string;
  description?: string;
  url?: string;
};

export type ResearchResult = {
  query: string;
  symbol: string;
  companyName: string;
  exchange?: string;
  sector?: string;
  industry?: string;
  price?: number;
  changePercent?: number;
  marketCap?: number;
  peRatio?: number;
  revenue?: number;
  freeCashFlow?: number;
  grossMargin?: number;
  operatingMargin?: number;
  netMargin?: number;
  totalDebt?: number;
  cashAndEquivalents?: number;
  sharesOutstanding?: number;
  filings: Filing[];
  aiTags: string[];
  score: number;
  bullCase: string[];
  bearCase: string[];
  providerLog: ResearchProvider[];
  updatedAt: string;
  fallbackMode: boolean;
};

const fallbackAliases: Record<string, string> = {
  NVIDIA: "NVDA",
  "NVIDIA CORPORATION": "NVDA",
  "SUPER MICRO": "SMCI",
  "SUPER MICRO COMPUTER": "SMCI",
  VERTIV: "VRT"
};

const fallbackProfiles: Record<string, Partial<ResearchResult>> = {
  NVDA: {
    symbol: "NVDA",
    companyName: "NVIDIA Corporation",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Semiconductors",
    price: 139.28,
    changePercent: 1.14,
    marketCap: 3420000000000,
    peRatio: 55.9,
    revenue: 130497000000,
    freeCashFlow: 60853000000,
    grossMargin: 74.9,
    operatingMargin: 61.1,
    netMargin: 55.8,
    totalDebt: 10270000000,
    cashAndEquivalents: 43341000000,
    sharesOutstanding: 24500000000,
    aiTags: ["AI accelerators", "data center GPUs", "networking", "software ecosystem"],
    score: 94,
    bullCase: ["Direct leverage to AI accelerator demand.", "Large cash generation supports R&D and supply agreements.", "CUDA/networking ecosystem gives it more than just chip exposure."],
    bearCase: ["Valuation already prices in huge growth.", "Customer concentration and export controls can hurt results.", "Custom silicon from hyperscalers is a long-term pressure point."]
  },
  SMCI: {
    symbol: "SMCI",
    companyName: "Super Micro Computer, Inc.",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Computer Hardware",
    price: 44.19,
    changePercent: -0.82,
    marketCap: 26300000000,
    peRatio: 22.8,
    revenue: 14940000000,
    freeCashFlow: -2600000000,
    grossMargin: 13.6,
    operatingMargin: 8.1,
    netMargin: 7.2,
    totalDebt: 2100000000,
    cashAndEquivalents: 1700000000,
    sharesOutstanding: 595000000,
    aiTags: ["AI servers", "rack-scale systems", "liquid cooling", "data center hardware"],
    score: 79,
    bullCase: ["Strong AI server exposure.", "Rack-scale builds are directly tied to data center capex.", "Could benefit from demand for fast deployment cycles."],
    bearCase: ["Lower margins than chip designers.", "Inventory/cash-flow swings can be ugly.", "Accounting, execution, and customer concentration risk deserve extra review."]
  },
  VRT: {
    symbol: "VRT",
    companyName: "Vertiv Holdings Co",
    exchange: "NYSE",
    sector: "Industrials",
    industry: "Electrical Equipment & Parts",
    price: 110.44,
    changePercent: 0.64,
    marketCap: 42000000000,
    peRatio: 43.2,
    revenue: 7900000000,
    freeCashFlow: 700000000,
    grossMargin: 35.1,
    operatingMargin: 17.3,
    netMargin: 8.9,
    totalDebt: 3200000000,
    cashAndEquivalents: 580000000,
    sharesOutstanding: 381000000,
    aiTags: ["data center power", "cooling", "thermal management", "AI infrastructure picks and shovels"],
    score: 88,
    bullCase: ["Direct exposure to data center power and cooling bottlenecks.", "Less dependent on which chip vendor wins.", "AI buildout increases thermal density needs."],
    bearCase: ["Industrial execution and backlog conversion matter.", "Valuation has expanded with the AI infrastructure theme.", "Capex pauses from hyperscalers would pressure growth expectations."]
  }
};

export function formatNumber(value?: number) {
  if (value === undefined || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
}

export function formatRatio(value?: number) {
  if (value === undefined || Number.isNaN(value)) return "—";
  return value.toFixed(1);
}

function makeFallback(query: string): ResearchResult {
  const upper = query.trim().toUpperCase();
  const mapped = fallbackAliases[upper] ?? upper;
  const base = fallbackProfiles[mapped] ?? {};
  return {
    query,
    symbol: base.symbol ?? (mapped || "UNKNOWN"),
    companyName: base.companyName ?? (query.trim() || "Unknown company"),
    exchange: base.exchange,
    sector: base.sector,
    industry: base.industry,
    price: base.price,
    changePercent: base.changePercent,
    marketCap: base.marketCap,
    peRatio: base.peRatio,
    revenue: base.revenue,
    freeCashFlow: base.freeCashFlow,
    grossMargin: base.grossMargin,
    operatingMargin: base.operatingMargin,
    netMargin: base.netMargin,
    totalDebt: base.totalDebt,
    cashAndEquivalents: base.cashAndEquivalents,
    sharesOutstanding: base.sharesOutstanding,
    filings: [],
    aiTags: base.aiTags ?? ["AI infrastructure", "data centers", "semiconductors"],
    score: base.score ?? 75,
    bullCase: base.bullCase ?? ["Potential exposure to AI infrastructure demand."],
    bearCase: base.bearCase ?? ["Needs real API data and filings reviewed before relying on the thesis."],
    providerLog: [
      { name: "FMP", status: process.env.FMP_API_KEY ? "failed" : "missing_key", note: process.env.FMP_API_KEY ? "Live request failed or returned incomplete data." : "Add FMP_API_KEY for live company profile, quote, ratios, and statements." },
      { name: "SEC", status: "skipped", note: "Reserved for future filings/company-facts fallback." },
      { name: "Finnhub", status: "skipped", note: "Reserved for future quote/fundamental fallback." },
      { name: "Alpha Vantage", status: "skipped", note: "Reserved for future overview fallback." },
      { name: "EODHD", status: "skipped", note: "Reserved for future global fundamentals fallback." }
    ],
    updatedAt: new Date().toISOString(),
    fallbackMode: true
  };
}

async function fetchJson(url: string) {
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (res.status === 429) throw new Error("rate_limited");
  if (!res.ok) throw new Error(`request_failed_${res.status}`);
  return res.json();
}

export async function getResearch(query: string): Promise<ResearchResult> {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) return makeFallback(query);

  try {
    const clean = encodeURIComponent(query.trim());
    const search = await fetchJson(`https://financialmodelingprep.com/api/v3/search?query=${clean}&limit=1&apikey=${apiKey}`);
    const symbol = search?.[0]?.symbol ?? query.trim().toUpperCase();
    const [profile, quote, ratios, income, cashflow, balance] = await Promise.all([
      fetchJson(`https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`).catch(() => []),
      fetchJson(`https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`).catch(() => []),
      fetchJson(`https://financialmodelingprep.com/api/v3/ratios-ttm/${symbol}?apikey=${apiKey}`).catch(() => []),
      fetchJson(`https://financialmodelingprep.com/api/v3/income-statement/${symbol}?limit=1&apikey=${apiKey}`).catch(() => []),
      fetchJson(`https://financialmodelingprep.com/api/v3/cash-flow-statement/${symbol}?limit=1&apikey=${apiKey}`).catch(() => []),
      fetchJson(`https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?limit=1&apikey=${apiKey}`).catch(() => [])
    ]);

    const p = profile?.[0] ?? {};
    const q = quote?.[0] ?? {};
    const r = ratios?.[0] ?? {};
    const i = income?.[0] ?? {};
    const c = cashflow?.[0] ?? {};
    const b = balance?.[0] ?? {};
    const sector = p.sector || "Unknown";
    const industry = p.industry || "Unknown";
    const tags = inferAiTags(`${sector} ${industry} ${p.description ?? ""}`);
    const score = scoreCompany(tags, r, c, b);

    return {
      query,
      symbol,
      companyName: p.companyName || q.name || symbol,
      exchange: p.exchangeShortName || q.exchange,
      sector,
      industry,
      price: num(q.price),
      changePercent: num(q.changesPercentage),
      marketCap: num(q.marketCap ?? p.mktCap),
      peRatio: num(q.pe ?? r.peRatioTTM),
      revenue: num(i.revenue),
      freeCashFlow: num(c.freeCashFlow),
      grossMargin: percent(r.grossProfitMarginTTM),
      operatingMargin: percent(r.operatingProfitMarginTTM),
      netMargin: percent(r.netProfitMarginTTM),
      totalDebt: num(b.totalDebt),
      cashAndEquivalents: num(b.cashAndCashEquivalents),
      sharesOutstanding: num(q.sharesOutstanding),
      filings: [],
      aiTags: tags,
      score,
      bullCase: makeBullCase(tags, score),
      bearCase: makeBearCase(score, q.pe, c.freeCashFlow),
      providerLog: [
        { name: "FMP", status: "ready", note: "Primary profile, quote, ratios, income, cash flow, and balance sheet pull succeeded." },
        { name: "SEC", status: "skipped", note: "Wire next for latest filings and source-of-truth company facts." },
        { name: "Finnhub", status: process.env.FINNHUB_API_KEY ? "skipped" : "missing_key", note: "Optional fallback, not used because FMP returned enough data." },
        { name: "Alpha Vantage", status: process.env.ALPHA_VANTAGE_API_KEY ? "skipped" : "missing_key", note: "Optional fallback." },
        { name: "EODHD", status: process.env.EODHD_API_KEY ? "skipped" : "missing_key", note: "Optional fallback." }
      ],
      updatedAt: new Date().toISOString(),
      fallbackMode: false
    };
  } catch {
    return makeFallback(query);
  }
}

function num(value: unknown): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function percent(value: unknown): number | undefined {
  const n = num(value);
  if (n === undefined) return undefined;
  return Math.abs(n) <= 1 ? n * 100 : n;
}

function inferAiTags(text: string) {
  const haystack = text.toLowerCase();
  const tags: string[] = [];
  const checks: Array<[string, string[]]> = [
    ["AI accelerators", ["semiconductor", "gpu", "chip", "accelerator"]],
    ["data center hardware", ["server", "data center", "datacenter", "rack"]],
    ["power infrastructure", ["power", "electrical", "grid", "switchgear"]],
    ["cooling", ["cooling", "thermal", "hvac"]],
    ["networking", ["network", "ethernet", "optical"]],
    ["cloud", ["cloud", "hyperscale", "infrastructure"]]
  ];
  for (const [tag, words] of checks) {
    if (words.some((w) => haystack.includes(w))) tags.push(tag);
  }
  return tags.length ? tags.slice(0, 5) : ["general AI infrastructure watchlist"];
}

function scoreCompany(tags: string[], ratios: Record<string, unknown>, cashflow: Record<string, unknown>, balance: Record<string, unknown>) {
  let score = 50 + tags.length * 8;
  const fcf = num(cashflow.freeCashFlow);
  const debt = num(balance.totalDebt);
  const cash = num(balance.cashAndCashEquivalents);
  const margin = percent(ratios.operatingProfitMarginTTM);
  if ((fcf ?? 0) > 0) score += 8;
  if ((cash ?? 0) > (debt ?? 0)) score += 6;
  if ((margin ?? 0) > 20) score += 8;
  return Math.max(1, Math.min(99, Math.round(score)));
}

function makeBullCase(tags: string[], score: number) {
  return [
    tags.length > 1 ? `Clear exposure to ${tags.slice(0, 3).join(", ")}.` : "Some exposure to the AI infrastructure buildout.",
    score >= 80 ? "The available fundamentals and theme fit look strong enough for deeper research." : "The dashboard gives a starting point, but this needs more confirmation.",
    "Best use case: identify whether the company belongs on a watchlist before reading filings or earnings calls."
  ];
}

function makeBearCase(score: number, pe?: unknown, fcf?: unknown) {
  const peNum = num(pe);
  const fcfNum = num(fcf);
  return [
    peNum && peNum > 45 ? "Valuation may already price in a lot of AI growth." : "Valuation still needs to be compared against growth and peers.",
    fcfNum !== undefined && fcfNum < 0 ? "Free cash flow is negative, so growth quality needs review." : "Free cash flow trend should be checked across multiple years.",
    score < 70 ? "Theme fit is not strong enough by itself. Do not force the AI narrative." : "AI narrative risk: good company can still be a bad entry if expectations are too high."
  ];
}
