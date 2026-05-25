"use client";

import { FormEvent, useMemo, useState } from "react";
import { Search } from "lucide-react";

const suggestions = [
  { symbol: "NVDA", name: "NVIDIA Corporation", theme: "AI chips" },
  { symbol: "AMD", name: "Advanced Micro Devices", theme: "AI accelerators" },
  { symbol: "TSM", name: "Taiwan Semiconductor", theme: "Foundry" },
  { symbol: "SMCI", name: "Super Micro Computer", theme: "AI servers" },
  { symbol: "VRT", name: "Vertiv Holdings", theme: "Power and cooling" },
  { symbol: "AVGO", name: "Broadcom", theme: "Networking chips" },
  { symbol: "ARM", name: "Arm Holdings", theme: "Chip architecture" },
  { symbol: "MU", name: "Micron Technology", theme: "Memory" },
  { symbol: "ANET", name: "Arista Networks", theme: "Data center networking" },
  { symbol: "DELL", name: "Dell Technologies", theme: "AI servers" },
  { symbol: "ETN", name: "Eaton", theme: "Electrical infrastructure" },
  { symbol: "ORCL", name: "Oracle", theme: "Cloud infrastructure" },
  { symbol: "MSFT", name: "Microsoft", theme: "AI cloud" },
  { symbol: "GOOGL", name: "Alphabet", theme: "AI cloud" },
  { symbol: "AMZN", name: "Amazon", theme: "AWS data centers" },
  { symbol: "META", name: "Meta Platforms", theme: "AI capex" },
  { symbol: "MRVL", name: "Marvell Technology", theme: "Custom silicon" }
];

export default function SearchBox({ initialQuery = "", compact = false }: { initialQuery?: string; compact?: boolean }) {
  const [value, setValue] = useState(initialQuery);
  const clean = value.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!clean || compact) return [];
    return suggestions
      .filter((item) =>
        item.symbol.toLowerCase().includes(clean) ||
        item.name.toLowerCase().includes(clean) ||
        item.theme.toLowerCase().includes(clean)
      )
      .slice(0, 5);
  }, [clean, compact]);

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

      {matches.length > 0 && (
        <div className="suggestions" aria-label="Ticker suggestions">
          {matches.map((item) => (
            <button key={item.symbol} type="button" onClick={() => go(item.symbol)}>
              <span className="suggestion-symbol">{item.symbol}</span>
              <span className="suggestion-name">{item.name}</span>
              <span className="suggestion-theme">{item.theme}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
