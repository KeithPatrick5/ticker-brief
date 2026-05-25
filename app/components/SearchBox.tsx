"use client";

import { FormEvent, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SYMBOLS } from "../../lib/data/symbols";

function isTickerLike(value: string) {
  return /^[a-zA-Z][a-zA-Z.\-]{0,9}$/.test(value.trim());
}

function scoreMatch(item: { symbol: string; name: string; theme: string }, clean: string) {
  const symbol = item.symbol.toLowerCase();
  const name = item.name.toLowerCase();
  const theme = item.theme.toLowerCase();

  if (symbol === clean) return 0;
  if (symbol.startsWith(clean)) return 1;
  if (name.startsWith(clean)) return 2;
  if (name.includes(` ${clean}`)) return 3;
  if (theme.includes(clean)) return 4;
  if (symbol.includes(clean)) return 5;
  if (name.includes(clean)) return 6;
  return 99;
}

export default function SearchBox({ initialQuery = "", compact = false }: { initialQuery?: string; compact?: boolean }) {
  const [value, setValue] = useState(initialQuery);
  const clean = value.trim().toLowerCase();
  const exactTicker = value.trim().toUpperCase();

  const matches = useMemo(() => {
    if (!clean || compact) return [];

    return SYMBOLS
      .map((item) => ({ item, score: scoreMatch(item, clean) }))
      .filter((entry) => entry.score < 99)
      .sort((a, b) => a.score - b.score || a.item.symbol.localeCompare(b.item.symbol))
      .slice(0, 8)
      .map((entry) => entry.item);
  }, [clean, compact]);

  const hasExactSymbol = matches.some((item) => item.symbol.toUpperCase() === exactTicker);
  const showExactSearch = Boolean(clean && !compact && isTickerLike(value) && !hasExactSymbol);

  function go(query: string) {
    const q = query.trim();
    if (!q) return;
    window.location.href = `/?q=${encodeURIComponent(q)}`;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    go(value);
  }

  return (
    <div className="search-wrap">
      <form className="search" onSubmit={onSubmit}>
        <input
          name="q"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ticker or company name"
          autoComplete="off"
          aria-label="Search ticker or company"
        />
        <button type="submit" aria-label="Search">
          <Search size={17} />
          <span>Search</span>
        </button>
      </form>

      {(matches.length > 0 || showExactSearch) && (
        <div className="suggestions" aria-label="Ticker suggestions">
          {matches.map((item) => (
            <button key={item.symbol} type="button" onClick={() => go(item.symbol)}>
              <span className="suggestion-symbol">{item.symbol}</span>
              <span className="suggestion-name">{item.name}</span>
              <span className="suggestion-theme">{item.theme}</span>
            </button>
          ))}
          {showExactSearch && (
            <button type="button" className="exact-search" onClick={() => go(exactTicker)}>
              <span className="suggestion-symbol">{exactTicker}</span>
              <span className="suggestion-name">Search exact ticker</span>
              <span className="suggestion-theme">Works even if it is not in the local suggestion file</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
