import type { ReactNode } from "react";
import { TrendingUp, AlertTriangle, Zap, Building2, WalletCards, BarChart3 } from "lucide-react";
import SearchBox from "./components/SearchBox";
import { getResearch, formatNumber, formatRatio } from "../lib/providers";

type HomeProps = { searchParams?: Promise<{ q?: string }> };

const relatedStocks: Record<string, string[]> = {
  NVDA: ["AMD", "TSM", "AVGO", "SMCI", "VRT"],
  AMD: ["NVDA", "TSM", "AVGO", "MRVL", "MU"],
  TSM: ["NVDA", "AMD", "AVGO", "ARM", "MU"],
  SMCI: ["NVDA", "DELL", "VRT", "AMD", "ANET"],
  VRT: ["ETN", "SMCI", "DELL", "NVDA", "ANET"]
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const query = params?.q?.trim() || "";
  const data = query ? await getResearch(query) : null;
  const related = data ? relatedStocks[data.symbol] ?? ["NVDA", "AMD", "TSM", "SMCI", "VRT"] : [];

  return (
    <main className="shell">
      <section className={data ? "search-panel compact" : "search-panel"}>
        <a className="home-banner" href="/" aria-label="Doug's Search home">
          <img src="/dougs-search-banner.png" alt="Doug's Search" />
        </a>
        <SearchBox initialQuery={query} compact={Boolean(data)} />
      </section>

      {data && (
        <section className="results-stack" aria-label={`${data.symbol} research brief`}>
          <section className="panel company-panel">
            <div className="company-head">
              <div>
                <div className="symbol-line">
                  <h2>{data.symbol}</h2>
                  {data.exchange && <span>{data.exchange}</span>}
                </div>
                <p>{data.companyName}</p>
              </div>
              <div className="price-block">
                <div className="price">{data.price ? `$${data.price.toFixed(2)}` : "—"}</div>
                <div className={Number(data.changePercent) >= 0 ? "change good" : "change bad"}>
                  {data.changePercent === undefined ? "—" : `${data.changePercent >= 0 ? "+" : ""}${data.changePercent.toFixed(2)}%`}
                </div>
              </div>
            </div>

            <div className="metrics">
              <Metric icon={<Building2 size={14} />} label="Market cap" value={formatNumber(data.marketCap)} />
              <Metric icon={<BarChart3 size={14} />} label="P/E" value={formatRatio(data.peRatio)} />
              <Metric icon={<TrendingUp size={14} />} label="Revenue" value={formatNumber(data.revenue)} />
              <Metric icon={<WalletCards size={14} />} label="Free cash flow" value={formatNumber(data.freeCashFlow)} />
            </div>

            <div className="sub-meta">
              <span>{data.sector || "Sector unknown"}</span>
              <span>{data.industry || "Industry unknown"}</span>
            </div>
          </section>

          <section className="panel score-panel">
            <div className="score-left">
              <div className="label">AI infrastructure score</div>
              <div className="score">{data.score}</div>
            </div>
            <div className="tag-cloud">
              {data.aiTags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          </section>

          <section className="brief-grid">
            <BriefCard icon={<Zap size={15} />} title="Bull case" items={data.bullCase} />
            <BriefCard icon={<AlertTriangle size={15} />} title="Bear case" items={data.bearCase} />
          </section>

          <section className="panel financial-panel">
            <h3>Financial snapshot</h3>
            <div className="mini-metrics">
              <MiniMetric label="Gross margin" value={data.grossMargin === undefined ? "—" : `${data.grossMargin.toFixed(1)}%`} />
              <MiniMetric label="Operating margin" value={data.operatingMargin === undefined ? "—" : `${data.operatingMargin.toFixed(1)}%`} />
              <MiniMetric label="Net margin" value={data.netMargin === undefined ? "—" : `${data.netMargin.toFixed(1)}%`} />
              <MiniMetric label="Debt" value={formatNumber(data.totalDebt)} />
              <MiniMetric label="Cash" value={formatNumber(data.cashAndEquivalents)} />
              <MiniMetric label="Shares" value={data.sharesOutstanding ? data.sharesOutstanding.toLocaleString() : "—"} />
            </div>
          </section>

          <section className="related-panel" aria-label="Related AI infrastructure stocks">
            {related.map((ticker) => <a key={ticker} href={`/?q=${ticker}`}>{ticker}</a>)}
          </section>
        </section>
      )}
    </main>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="metric">
      <div className="metric-label">{icon}<span>{label}</span></div>
      <strong>{value}</strong>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="mini-metric">
      <div>{label}</div>
      <strong>{value}</strong>
    </div>
  );
}

function BriefCard({ title, items, icon }: { title: string; items: string[]; icon: ReactNode }) {
  return (
    <div className="panel brief-card">
      <h3>{icon}{title}</h3>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}
