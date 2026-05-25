import type { ReactNode } from "react";
import { TrendingUp, AlertTriangle, Zap, Building2, WalletCards, BarChart3, PlugZap } from "lucide-react";
import SearchBox from "./components/SearchBox";
import DougLogo from "./components/DougLogo";
import { getResearch, formatNumber, formatRatio } from "../lib/providers";

type HomeProps = { searchParams?: Promise<{ q?: string }> };

const relatedStocks: Record<string, string[]> = {
  NVDA: ["AMD", "TSM", "AVGO", "SMCI", "VRT"],
  AMD: ["NVDA", "TSM", "AVGO", "MRVL", "MU"],
  TSM: ["NVDA", "AMD", "AVGO", "ARM", "MU"],
  SMCI: ["NVDA", "DELL", "VRT", "AMD", "ANET"],
  VRT: ["ETN", "SMCI", "DELL", "NVDA", "ANET"],
  IBM: ["MSFT", "ORCL", "GOOGL", "AMZN", "NVDA"]
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const query = params?.q?.trim() || "";
  const data = query ? await getResearch(query) : null;
  const hasUsableData = Boolean(data && (data.dataStatus === "ready" || data.dataStatus === "demo"));
  const related = hasUsableData && data ? relatedStocks[data.symbol] ?? ["NVDA", "AMD", "TSM", "SMCI", "VRT"] : [];

  const topMetrics = data ? [
    { icon: <Building2 size={14} />, label: "Market cap", value: formatNumber(data.marketCap), show: data.marketCap !== undefined },
    { icon: <BarChart3 size={14} />, label: "P/E", value: formatRatio(data.peRatio), show: data.peRatio !== undefined },
    { icon: <TrendingUp size={14} />, label: "Revenue", value: formatNumber(data.revenue), show: data.revenue !== undefined },
    { icon: <WalletCards size={14} />, label: "Free cash flow", value: formatNumber(data.freeCashFlow), show: data.freeCashFlow !== undefined }
  ].filter((item) => item.show) : [];

  const miniMetrics = data ? [
    { label: "Gross margin", value: data.grossMargin === undefined ? "—" : `${data.grossMargin.toFixed(1)}%`, show: data.grossMargin !== undefined },
    { label: "Operating margin", value: data.operatingMargin === undefined ? "—" : `${data.operatingMargin.toFixed(1)}%`, show: data.operatingMargin !== undefined },
    { label: "Net margin", value: data.netMargin === undefined ? "—" : `${data.netMargin.toFixed(1)}%`, show: data.netMargin !== undefined },
    { label: "Debt", value: formatNumber(data.totalDebt), show: data.totalDebt !== undefined },
    { label: "Cash", value: formatNumber(data.cashAndEquivalents), show: data.cashAndEquivalents !== undefined },
    { label: "Shares", value: data.sharesOutstanding ? data.sharesOutstanding.toLocaleString() : "—", show: data.sharesOutstanding !== undefined }
  ].filter((item) => item.show) : [];

  return (
    <main className="shell">
      <section className={data ? "search-panel compact" : "search-panel"}>
        <DougLogo />
        <SearchBox initialQuery={query} compact={Boolean(data)} />
      </section>

      {data && !hasUsableData && (
        <section className="results-stack" aria-label="Search status">
          <section className="panel empty-panel">
            <div className="empty-icon"><PlugZap size={18} /></div>
            <h2>{data.symbol}</h2>
            <p>{statusMessage(data.dataStatus, data.errorMessage)}</p>
            <div className="quick-row">
              {["NVDA", "IBM", "AMD", "MSFT", "AAPL"].map((ticker) => <a key={ticker} href={`/?q=${ticker}`}>{ticker}</a>)}
            </div>
          </section>
        </section>
      )}

      {data && hasUsableData && (
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
              {(data.price !== undefined || data.changePercent !== undefined) && (
                <div className="price-block">
                  <div className="price">{data.price !== undefined ? `$${data.price.toFixed(2)}` : "—"}</div>
                  <div className={Number(data.changePercent) >= 0 ? "change good" : "change bad"}>
                    {data.changePercent === undefined ? "—" : `${data.changePercent >= 0 ? "+" : ""}${data.changePercent.toFixed(2)}%`}
                  </div>
                </div>
              )}
            </div>

            {topMetrics.length > 0 && (
              <div className="metrics">
                {topMetrics.map((metric) => (
                  <Metric key={metric.label} icon={metric.icon} label={metric.label} value={metric.value} />
                ))}
              </div>
            )}

            <div className="sub-meta">
              {data.sector && <span>{data.sector}</span>}
              {data.industry && <span>{data.industry}</span>}
              {data.dataStatus === "demo" && <span>Sample data</span>}
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

          {(data.bullCase.length > 0 || data.bearCase.length > 0) && (
            <section className="brief-grid">
              {data.bullCase.length > 0 && <BriefCard icon={<Zap size={15} />} title="Bull case" items={data.bullCase} />}
              {data.bearCase.length > 0 && <BriefCard icon={<AlertTriangle size={15} />} title="Bear case" items={data.bearCase} />}
            </section>
          )}

          {miniMetrics.length > 0 && (
            <section className="panel financial-panel">
              <h3>Financial snapshot</h3>
              <div className="mini-metrics">
                {miniMetrics.map((metric) => (
                  <MiniMetric key={metric.label} label={metric.label} value={metric.value} />
                ))}
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section className="related-panel" aria-label="Related AI infrastructure stocks">
              {related.map((ticker) => <a key={ticker} href={`/?q=${ticker}`}>{ticker}</a>)}
            </section>
          )}
        </section>
      )}
    </main>
  );
}

function statusMessage(status: string, error?: string) {
  if (status === "needs_key") return "FMP is not connected. Add FMP_API_KEY in Vercel, redeploy, then live searches will work.";
  if (status === "not_found") return "FMP did not return a company match for that search. Try the exact ticker symbol.";
  if (status === "provider_error") return error || "FMP is connected, but the request failed. Check the API key, plan, or endpoint access.";
  return error || "Search failed.";
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
