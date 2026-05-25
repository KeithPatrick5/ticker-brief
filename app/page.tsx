import { Search, Server, ShieldCheck, Zap } from "lucide-react";
import { getResearch, formatNumber, formatRatio } from "../lib/providers";

type HomeProps = { searchParams?: Promise<{ q?: string }> };

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const query = params?.q || "NVDA";
  const data = await getResearch(query);
  const change = data.changePercent ?? 0;

  return (
    <main className="shell">
      <div className="topbar">
        <div className="brand">
          <div className="logo">TB</div>
          <div>
            <div className="kicker">AI infrastructure research</div>
            <div className="title">Ticker Brief</div>
          </div>
        </div>
        <div className="status-pill">Vercel-ready · API fallback · cached</div>
      </div>

      <section className="hero">
        <div className="panel pad">
          <div className="kicker">One box stock research</div>
          <h1>Type a ticker. Get the brief.</h1>
          <p>
            Built for the guy who gets ideas from YouTube, then wants the numbers fast: valuation,
            cash flow, margins, debt, filings, AI infrastructure fit, and a plain-English bull/bear read.
          </p>
          <form className="search" action="/" method="get">
            <input name="q" defaultValue={query} placeholder="NVDA, Vertiv, Super Micro, TSM..." />
            <button type="submit"><Search size={16} /> Search</button>
          </form>
        </div>

        <div className="panel pad">
          <div className="smallgrid">
            <div className="mini"><div className="label">Primary</div><div className="value">FMP</div></div>
            <div className="mini"><div className="label">Official filings</div><div className="value">SEC</div></div>
            <div className="mini"><div className="label">Fallback</div><div className="value">Finnhub</div></div>
            <div className="mini"><div className="label">Cache</div><div className="value">1-24h</div></div>
          </div>
        </div>
      </section>

      <section className="panel pad" style={{ marginTop: 12 }}>
        <div className="kicker">Current brief</div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
          <div>
            <h1 style={{ fontSize: 42, marginTop: 8 }}>{data.symbol}</h1>
            <p>{data.companyName} · {data.exchange || "Exchange unknown"} · {data.sector || "Sector unknown"} · {data.industry || "Industry unknown"}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="label">Price</div>
            <div className="value">{data.price ? `$${data.price.toFixed(2)}` : "—"}</div>
            <div style={{ color: change >= 0 ? "var(--green)" : "var(--red)", fontSize: 13 }}>{change ? `${change.toFixed(2)}%` : "—"}</div>
          </div>
        </div>

        {data.fallbackMode && (
          <div className="card" style={{ marginTop: 12, borderColor: "#735e2b" }}>
            <strong style={{ color: "var(--amber)" }}>Demo/fallback mode:</strong>{" "}
            Add API keys in Vercel env vars to turn this into live pulls. The UI and route are already wired.
          </div>
        )}

        <div className="metrics">
          <Metric label="Market cap" value={formatNumber(data.marketCap)} />
          <Metric label="P/E" value={formatRatio(data.peRatio)} />
          <Metric label="Revenue" value={formatNumber(data.revenue)} />
          <Metric label="Free cash flow" value={formatNumber(data.freeCashFlow)} />
          <Metric label="Gross margin" value={pct(data.grossMargin)} />
          <Metric label="Operating margin" value={pct(data.operatingMargin)} />
          <Metric label="Total debt" value={formatNumber(data.totalDebt)} />
          <Metric label="Cash" value={formatNumber(data.cashAndEquivalents)} />
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <h2><Zap size={14} /> AI infrastructure score</h2>
          <div className="scorebox">
            <div className="score">{data.score}</div>
            <div>
              <p>This is not a buy/sell signal. It is a fast theme-fit score for the AI buildout thesis.</p>
              <div className="tags">{data.aiTags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
            </div>
          </div>
        </div>
        <div className="card">
          <h2><ShieldCheck size={14} /> Bull case</h2>
          <ul>{data.bullCase.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="card">
          <h2><Server size={14} /> Bear case</h2>
          <ul>{data.bearCase.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>

      <section className="grid">
        <div className="card" style={{ gridColumn: "span 2" }}>
          <h2>Provider fallback log</h2>
          {data.providerLog.map((p) => (
            <div className="provider" key={p.name}>
              <strong>{p.name}</strong>
              <span className={`badge ${p.status}`}>{p.status.replace("_", " ")}</span>
              <span style={{ color: "var(--muted)" }}>{p.note}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <h2>Filings</h2>
          {data.filings.length ? data.filings.map((f) => (
            <div className="provider" key={`${f.form}-${f.filed}`} style={{ gridTemplateColumns: "70px 80px 1fr" }}>
              <strong>{f.form}</strong><span>{f.filed}</span><span style={{ color: "var(--muted)" }}>{f.description || "SEC filing"}</span>
            </div>
          )) : <p>SEC filings are next in the wiring sequence.</p>}
        </div>
      </section>

      <div className="footer">
        Research only. Not financial advice. Data providers have rate limits/licensing rules, so this app caches pulls and shows which provider supplied each field.
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="metric"><div className="label">{label}</div><strong>{value}</strong></div>;
}

function pct(value?: number) {
  if (value === undefined || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)}%`;
}
