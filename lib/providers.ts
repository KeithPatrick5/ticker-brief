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

export type DataStatus = "ready" | "demo" | "needs_key" | "not_found" | "provider_error";

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
  dataStatus: DataStatus;
  errorMessage?: string;
};

type AnyRecord = Record<string, unknown>;

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
  const hasDemo = Boolean(base.symbol);
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
    aiTags: base.aiTags ?? [],
    score: base.score ?? 0,
    bullCase: base.bullCase ?? [],
    bearCase: base.bearCase ?? [],
    providerLog: [
      { name: "FMP", status: "missing_key", note: "Add FMP_API_KEY for live company data." }
    ],
    updatedAt: new Date().toISOString(),
    fallbackMode: true,
    dataStatus: hasDemo ? "demo" : "needs_key",
    errorMessage: hasDemo ? undefined : "FMP_API_KEY is missing."
  };
}

function makeStatus(query: string, dataStatus: Exclude<DataStatus, "ready" | "demo">, message: string): ResearchResult {
  const clean = query.trim().toUpperCase() || "SEARCH";
  return {
    query,
    symbol: clean,
    companyName: query.trim() || "Unknown company",
    filings: [],
    aiTags: [],
    score: 0,
    bullCase: [],
    bearCase: [],
    providerLog: [
      { name: "FMP", status: dataStatus === "needs_key" ? "missing_key" : "failed", note: message }
    ],
    updatedAt: new Date().toISOString(),
    fallbackMode: false,
    dataStatus,
    errorMessage: message
  };
}

function makeFmpUrl(path: string, apiKey: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `https://financialmodelingprep.com${path}${separator}apikey=${apiKey}`;
}

async function fetchJson(url: string) {
  const res = await fetch(url, {
    next: { revalidate: 1800 },
    headers: { Accept: "application/json" }
  });

  if (res.status === 429) throw new Error("rate_limited");

  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`bad_json_${res.status}`);
  }

  if (!res.ok) {
    const message = getFmpMessage(data) || `request_failed_${res.status}`;
    throw new Error(message);
  }

  const fmpMessage = getFmpMessage(data);
  if (fmpMessage && /invalid|apikey|limit|upgrade|plan|access|error/i.test(fmpMessage)) {
    throw new Error(fmpMessage);
  }

  return data;
}

function getFmpMessage(data: unknown) {
  if (!data || typeof data !== "object") return "";
  const record = data as AnyRecord;
  return String(record["Error Message"] ?? record["Information"] ?? record.message ?? record.error ?? "");
}

async function fetchFirst(paths: string[], apiKey: string) {
  const errors: string[] = [];
  for (const path of paths) {
    try {
      return await fetchJson(makeFmpUrl(path, apiKey));
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  throw new Error(errors.find(Boolean) || "all_requests_failed");
}

function firstRow(data: unknown): AnyRecord {
  if (Array.isArray(data)) return (data[0] ?? {}) as AnyRecord;
  if (data && typeof data === "object") return data as AnyRecord;
  return {};
}

function hasKeys(record: AnyRecord) {
  return Object.keys(record).length > 0;
}

function isTickerLike(query: string) {
  return /^[A-Za-z][A-Za-z.\-]{0,9}$/.test(query.trim());
}

async function resolveSymbol(query: string, apiKey: string) {
  const trimmed = query.trim();
  if (isTickerLike(trimmed)) return trimmed.toUpperCase();

  const clean = encodeURIComponent(trimmed);
  const search = await fetchFirst([
    `/stable/search-symbol?query=${clean}&limit=5`,
    `/api/v3/search?query=${clean}&limit=5`
  ], apiKey).catch(() => []);

  if (!Array.isArray(search) || search.length === 0) return trimmed.toUpperCase();

  const preferred = search.find((item: AnyRecord) => {
    const exchange = String(item.exchangeShortName ?? item.exchange ?? item.stockExchange ?? "").toUpperCase();
    return ["NASDAQ", "NYSE", "AMEX"].includes(exchange);
  }) as AnyRecord | undefined;

  const item = preferred ?? (search[0] as AnyRecord);
  return String(item.symbol ?? item.ticker ?? trimmed).toUpperCase();
}

export async function getResearch(query: string): Promise<ResearchResult> {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) return makeFallback(query);

  try {
    const symbol = await resolveSymbol(query, apiKey);
    const encodedSymbol = encodeURIComponent(symbol);

    const [profileRaw, quoteRaw, ratiosRaw, incomeRaw, cashflowRaw, balanceRaw] = await Promise.all([
      fetchFirst([
        `/stable/profile?symbol=${encodedSymbol}`,
        `/api/v3/profile/${encodedSymbol}`
      ], apiKey).catch(() => []),
      fetchFirst([
        `/stable/quote?symbol=${encodedSymbol}`,
        `/api/v3/quote/${encodedSymbol}`
      ], apiKey).catch(() => []),
      fetchFirst([
        `/stable/ratios-ttm?symbol=${encodedSymbol}`,
        `/api/v3/ratios-ttm/${encodedSymbol}`
      ], apiKey).catch(() => []),
      fetchFirst([
        `/stable/income-statement?symbol=${encodedSymbol}&period=annual&limit=1`,
        `/api/v3/income-statement/${encodedSymbol}?period=annual&limit=1`
      ], apiKey).catch(() => []),
      fetchFirst([
        `/stable/cash-flow-statement?symbol=${encodedSymbol}&period=annual&limit=1`,
        `/api/v3/cash-flow-statement/${encodedSymbol}?period=annual&limit=1`
      ], apiKey).catch(() => []),
      fetchFirst([
        `/stable/balance-sheet-statement?symbol=${encodedSymbol}&period=annual&limit=1`,
        `/api/v3/balance-sheet-statement/${encodedSymbol}?period=annual&limit=1`
      ], apiKey).catch(() => [])
    ]);

    const p = firstRow(profileRaw);
    const q = firstRow(quoteRaw);
    const r = firstRow(ratiosRaw);
    const i = firstRow(incomeRaw);
    const c = firstRow(cashflowRaw);
    const b = firstRow(balanceRaw);

    const hasCompanyIdentity = hasKeys(p) || hasKeys(q);
    if (!hasCompanyIdentity) {
      return makeStatus(query, "not_found", `FMP returned no profile or quote for ${symbol}. Try the exact ticker symbol.`);
    }

    const companyName = str(p.companyName ?? p.companyNameLong ?? q.name ?? q.companyName ?? symbol);
    const sector = str(p.sector);
    const industry = str(p.industry);
    const exchange = str(p.exchangeShortName ?? p.exchange ?? q.exchange ?? q.exchangeShortName);
    const description = str(p.description ?? p.companyDescription);
    const tags = inferAiTags(`${sector} ${industry} ${description} ${companyName}`);
    const score = scoreCompany(tags, r, c, b);

    return {
      query,
      symbol: str(p.symbol ?? q.symbol ?? symbol) || symbol,
      companyName: companyName || symbol,
      exchange,
      sector,
      industry,
      price: num(q.price ?? p.price),
      changePercent: num(q.changesPercentage ?? q.changePercentage ?? q.changePercent),
      marketCap: num(q.marketCap ?? p.mktCap ?? p.marketCap),
      peRatio: num(q.pe ?? p.pe ?? r.peRatioTTM ?? r.peRatio),
      revenue: num(i.revenue),
      freeCashFlow: num(c.freeCashFlow ?? c.freeCashFlowTTM),
      grossMargin: percent(r.grossProfitMarginTTM ?? r.grossProfitMargin),
      operatingMargin: percent(r.operatingProfitMarginTTM ?? r.operatingProfitMargin),
      netMargin: percent(r.netProfitMarginTTM ?? r.netProfitMargin),
      totalDebt: num(b.totalDebt),
      cashAndEquivalents: num(b.cashAndCashEquivalents ?? b.cashAndShortTermInvestments),
      sharesOutstanding: num(q.sharesOutstanding ?? p.sharesOutstanding),
      filings: [],
      aiTags: tags,
      score,
      bullCase: makeBullCase(tags, score),
      bearCase: makeBearCase(score, q.pe ?? p.pe ?? r.peRatioTTM, c.freeCashFlow ?? c.freeCashFlowTTM),
      providerLog: [
        { name: "FMP", status: "ready", note: "Live FMP pull returned company data." },
        { name: "SEC", status: "skipped", note: "Reserved for filings in a later version." },
        { name: "Finnhub", status: "skipped", note: "Reserved fallback provider." },
        { name: "Alpha Vantage", status: "skipped", note: "Reserved fallback provider." },
        { name: "EODHD", status: "skipped", note: "Reserved fallback provider." }
      ],
      updatedAt: new Date().toISOString(),
      fallbackMode: false,
      dataStatus: "ready"
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown FMP error";
    const status = message === "rate_limited" ? "provider_error" : "provider_error";
    return makeStatus(query, status, `FMP request failed: ${message}`);
  }
}

function num(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function str(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const out = String(value).trim();
  return out || undefined;
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
    ["AI accelerators", ["semiconductor", "gpu", "chip", "accelerator", "processor"]],
    ["data center hardware", ["server", "data center", "datacenter", "rack", "hardware"]],
    ["power infrastructure", ["power", "electrical", "grid", "switchgear", "electrification"]],
    ["cooling", ["cooling", "thermal", "hvac"]],
    ["networking", ["network", "ethernet", "optical", "switching"]],
    ["cloud", ["cloud", "hyperscale", "infrastructure", "hosting"]],
    ["enterprise AI", ["software", "consulting", "enterprise", "automation", "watson"]]
  ];
  for (const [tag, words] of checks) {
    if (words.some((w) => haystack.includes(w))) tags.push(tag);
  }
  return tags.length ? tags.slice(0, 5) : ["general watchlist"];
}

function scoreCompany(tags: string[], ratios: AnyRecord, cashflow: AnyRecord, balance: AnyRecord) {
  let score = 45 + tags.length * 7;
  const fcf = num(cashflow.freeCashFlow ?? cashflow.freeCashFlowTTM);
  const debt = num(balance.totalDebt);
  const cash = num(balance.cashAndCashEquivalents ?? balance.cashAndShortTermInvestments);
  const margin = percent(ratios.operatingProfitMarginTTM ?? ratios.operatingProfitMargin);
  if ((fcf ?? 0) > 0) score += 8;
  if ((cash ?? 0) > (debt ?? 0)) score += 6;
  if ((margin ?? 0) > 20) score += 8;
  return Math.max(1, Math.min(99, Math.round(score)));
}

function makeBullCase(tags: string[], score: number) {
  return [
    tags.length > 1 ? `Relevant exposure found: ${tags.slice(0, 3).join(", ")}.` : "This may belong on a broader watchlist, but the AI infrastructure link needs confirmation.",
    score >= 80 ? "Theme fit looks strong enough for deeper research." : "Use this as a first-pass screen, then verify with filings and earnings calls.",
    "The useful next step is comparing the thesis against valuation and cash generation."
  ];
}

function makeBearCase(score: number, pe?: unknown, fcf?: unknown) {
  const peNum = num(pe);
  const fcfNum = num(fcf);
  return [
    peNum && peNum > 45 ? "Valuation may already price in a lot of AI growth." : "Valuation still needs to be compared against growth and peers.",
    fcfNum !== undefined && fcfNum < 0 ? "Free cash flow is negative, so growth quality needs review." : "Free cash flow trend should be checked across multiple years.",
    score < 70 ? "Theme fit is not strong enough by itself. Do not force the AI narrative." : "AI narrative risk: a good company can still be a bad entry if expectations are too high."
  ];
}
