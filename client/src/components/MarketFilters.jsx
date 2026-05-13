import { useState } from "react";

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "OPEN", label: "Open" },
  { key: "CLOSED", label: "Closed" },
  { key: "BINARY", label: "Binary" },
  { key: "MULTI_OUTCOME", label: "Multi" },
];

export default function MarketFilters({ onFilterChange }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    onFilterChange?.({ search: e.target.value, status: activeFilter });
  };

  const handleFilterClick = (key) => {
    setActiveFilter(key);
    onFilterChange?.({ search, status: key });
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative flex-1 min-w-[240px]">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search markets..."
          className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
        />
      </div>
      <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => handleFilterClick(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeFilter === f.key
                ? "bg-green-500 text-black"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}