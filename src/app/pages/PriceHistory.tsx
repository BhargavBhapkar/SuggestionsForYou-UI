import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ChevronRight, Search, TrendingUp, TrendingDown, ArrowRight,
  RefreshCw, Bell, BarChart2,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { inter, poppins } from "../lib/fonts";
import { DEFAULT_PRODUCT } from "../data/products";
import { useProducts, useProduct } from "../hooks/useApi";
import PHTooltip from "../components/PHTooltip";
import Reveal from "../components/Reveal";

const HOW_IT_WORKS = [
  { icon: RefreshCw,  title: "We track every 15 minutes",  desc: "Prices are pulled from 50+ retailers around the clock, so every chart reflects what's live right now." },
  { icon: BarChart2,  title: "You see the real pattern",    desc: "24 months of history reveals whether a 'sale' is genuine or just a manufactured markdown." },
  { icon: Bell,       title: "Get alerted at the right time",desc: "Set a target price on any product's comparison page and we'll notify you the moment it's hit." },
];

export default function PriceHistoryPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<"30d" | "90d" | "1y">("90d");

  const { data: allProducts } = useProducts({ limit: 50 });
  const { data: trendingProducts } = useProducts({ tag: "trending" });
  const { data: featured } = useProduct(DEFAULT_PRODUCT);

  const filtered = allProducts
    .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8)
    .map(p => ({ label: p.name, category: p.category }));

  const goToProduct = (name: string) => {
    if (!name.trim()) return;
    navigate(`/compare/${encodeURIComponent(name)}`);
  };

  const chartData = featured
    ? (activeTab === "30d" ? featured.priceHistory["30d"] : activeTab === "90d" ? featured.priceHistory["90d"] : featured.priceHistory["1y"])
    : [];
  const allPoints = featured
    ? [...featured.priceHistory["30d"], ...featured.priceHistory["90d"], ...featured.priceHistory["1y"]]
    : [];
  const allValues = allPoints.flatMap(p => [p.amazon, p.flipkart, p.croma]);
  const allTimeLow = allValues.length ? Math.min(...allValues) : 0;
  const allTimeHigh = allValues.length ? Math.max(...allValues) : 0;
  const latest = chartData[chartData.length - 1];

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] dark:bg-[#0a0e1f] transition-colors duration-300 overflow-hidden" style={inter}>
      <div className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-[#F97316]/0 dark:bg-[#F97316]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-96 -left-24 w-[360px] h-[360px] rounded-full bg-purple-400/0 dark:bg-purple-600/10 blur-3xl" />
      {/* ── Top Nav Bar ── */}
      <div className="sticky top-0 z-50 border-b border-[#E5E7EB] dark:border-white/10 bg-white/95 dark:bg-[#0a0e1f]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 rounded-xl text-[#6B7280] hover:text-[#F97316] hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all">
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <div className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.svg" alt="SuggestionsForYou" className="w-7 h-7 rounded-lg object-cover shadow-sm" />
            <span className="font-bold text-[#111827] dark:text-white text-sm hidden sm:block" style={poppins}>SuggestionsForYou</span>
          </div>
          <span className="text-[#D1D5DB] dark:text-white/20 hidden sm:block">/</span>
          <span className="text-sm text-[#6B7280] dark:text-gray-400 hidden sm:block" style={inter}>Price History</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 relative">
        {/* ── Hero ── */}
        <Reveal>
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold text-[#F97316] uppercase tracking-widest mb-2" style={inter}>Never Overpay Again</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] dark:text-white mb-3" style={poppins}>Price History</h1>
          <p className="text-[#6B7280] dark:text-gray-400 text-sm mb-8" style={inter}>
            Track how prices have changed over time for any product across all retailers. 24 months of data, updated every 15 minutes.
          </p>

          <div className="relative max-w-xl mx-auto">
            <div className={`flex items-center bg-white dark:bg-[#131B2E] border-2 transition-all duration-200 shadow-lg overflow-visible rounded-2xl ${showSuggestions && query.length > 0 ? "border-[#F97316] rounded-b-none" : "border-[#E5E7EB] dark:border-white/10 hover:border-orange-300 dark:hover:border-orange-700 focus-within:border-[#F97316]"}`}>
              <div className="pl-5 pr-3 text-[#9CA3AF] flex-shrink-0"><Search className="w-5 h-5" /></div>
              <input
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyDown={e => { if (e.key === "Enter") goToProduct(query); }}
                placeholder="Search a product to track its price history…"
                className="flex-1 py-4 text-sm text-[#111827] dark:text-white placeholder-[#9CA3AF] bg-transparent outline-none min-w-0"
                style={inter}
              />
              <button onClick={() => goToProduct(query)} className="m-2 px-5 py-3 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-orange-200 flex-shrink-0">
                Track <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {showSuggestions && query.trim().length > 0 && filtered.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white dark:bg-[#131B2E] border-2 border-t-0 border-[#F97316] dark:border-[#F97316] rounded-b-2xl shadow-xl z-40 overflow-hidden text-left">
                {filtered.map(s => (
                  <button
                    key={s.label}
                    onMouseDown={() => goToProduct(s.label)}
                    className="w-full flex items-center justify-between px-5 py-3 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors text-left"
                  >
                    <span className="text-sm text-[#111827] dark:text-white" style={inter}>{s.label}</span>
                    <span className="text-xs text-[#9CA3AF]" style={inter}>{s.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        </Reveal>

        {/* ── Featured Chart ── */}
        <Reveal>
        <div className="bg-white dark:bg-[#131B2E] rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-sm hover:shadow-lg dark:hover:shadow-orange-950/20 transition-shadow duration-300 overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-[#E5E7EB] dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#F97316] uppercase tracking-widest mb-1" style={inter}>Featured</p>
              <h2 className="font-bold text-[#111827] dark:text-white text-base" style={poppins}>{featured?.name ?? DEFAULT_PRODUCT} — Price Trend</h2>
              <p className="text-xs text-[#9CA3AF] mt-0.5" style={inter}>Track price movement across Amazon, Flipkart &amp; Croma</p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-[#F3F4F6] dark:bg-white/5 rounded-xl self-start">
              {([{ key: "30d", label: "30D" }, { key: "90d", label: "90D" }, { key: "1y", label: "1Y" }] as const).map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === t.key ? "bg-white dark:bg-[#0a0e1f] text-[#111827] dark:text-white shadow-sm" : "text-[#9CA3AF] hover:text-[#374151] dark:hover:text-gray-300"}`}
                  style={inter}
                >{t.label}</button>
              ))}
            </div>
          </div>

          {featured && latest ? (
          <>
          <div className="px-2 sm:px-4 pt-4 pb-2">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart key={activeTab} data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="phGradAmazon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.6} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF", fontFamily: "Inter, sans-serif" }} axisLine={false} tickLine={false} dy={8} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF", fontFamily: "Inter, sans-serif" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${Math.round(v / 1000)}K`} domain={["auto", "auto"]} width={52} />
                <Tooltip content={<PHTooltip />} cursor={{ stroke: "#F97316", strokeWidth: 1, strokeDasharray: "4 4" }} />
                <Area type="monotone" dataKey="amazon" name="Amazon" stroke="#F97316" strokeWidth={2.5} fill="url(#phGradAmazon)" dot={false} activeDot={{ r: 5, fill: "#F97316", strokeWidth: 2, stroke: "#fff" }} />
                <Area type="monotone" dataKey="flipkart" name="Flipkart" stroke="#2874F0" strokeWidth={2} fill="transparent" fillOpacity={0} dot={false} activeDot={{ r: 4, fill: "#2874F0", strokeWidth: 2, stroke: "#fff" }} />
                <Area type="monotone" dataKey="croma" name="Croma" stroke="#10B981" strokeWidth={2} fill="transparent" fillOpacity={0} dot={false} activeDot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "#fff" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="px-5 sm:px-6 pb-5">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {[{ color: "#F97316", label: "Amazon", price: `₹${latest.amazon.toLocaleString("en-IN")}` }, { color: "#2874F0", label: "Flipkart", price: `₹${latest.flipkart.toLocaleString("en-IN")}` }, { color: "#10B981", label: "Croma", price: `₹${latest.croma.toLocaleString("en-IN")}` }].map(l => (
                <span key={l.label} className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-gray-400" style={inter}>
                  <span className="w-3 h-1.5 rounded-full inline-block flex-shrink-0" style={{ background: l.color }} />
                  <span>{l.label}</span>
                  <span className="font-semibold text-[#374151] dark:text-gray-300">{l.price}</span>
                </span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: "All-time Low", value: `₹${allTimeLow.toLocaleString("en-IN")}`, color: "text-[#10B981]", bg: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-100 dark:border-emerald-900/40" },
                { label: "All-time High", value: `₹${allTimeHigh.toLocaleString("en-IN")}`, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/20", border: "border-red-100 dark:border-red-900/40" },
                { label: "Current", value: `₹${latest.amazon.toLocaleString("en-IN")}`, color: "text-[#F97316]", bg: "bg-orange-50 dark:bg-orange-950/20", border: "border-orange-100 dark:border-orange-900/40" },
              ].map(s => (
                <div key={s.label} className={`${s.bg} ${s.border} border rounded-xl p-3 text-center`}>
                  <p className={`text-sm font-bold ${s.color}`} style={poppins}>{s.value}</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5" style={inter}>{s.label}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => goToProduct(featured.name)}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-200"
              style={poppins}
            >
              View Full Comparison <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          </>
          ) : (
            <div className="px-5 sm:px-6 py-16 text-center text-sm text-[#9CA3AF]" style={inter}>Loading chart…</div>
          )}
        </div>
        </Reveal>

        {/* ── Trending Price Drops ── */}
        <div>
          <Reveal>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-semibold text-[#F97316] uppercase tracking-widest mb-1" style={inter}>Live Prices</p>
                <h2 className="text-xl font-bold text-[#111827] dark:text-white" style={poppins}>Trending Price Drops</h2>
              </div>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {trendingProducts.map((p, i) => (
              <Reveal key={p._id} delay={i * 50}>
                <button
                  onClick={() => goToProduct(p.name)}
                  className="group text-left w-full bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-orange-100 dark:hover:shadow-orange-950/30 hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div className="relative bg-[#F8FAFC] dark:bg-white/5 h-32 overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#10B981] text-white text-[10px] font-bold rounded-md flex items-center gap-0.5">
                      <TrendingDown className="w-2.5 h-2.5" /> {p.discount}%
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] text-[#9CA3AF] mb-0.5" style={inter}>{p.brand} · {p.category}</p>
                    <p className="text-xs font-semibold text-[#111827] dark:text-white leading-snug mb-1.5 line-clamp-2" style={poppins}>{p.name}</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-[#111827] dark:text-white" style={poppins}>₹{p.lowestPrice.toLocaleString("en-IN")}</span>
                      <span className="text-[10px] text-[#9CA3AF] line-through">₹{p.originalPrice.toLocaleString("en-IN")}</span>
                    </div>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#F97316] group-hover:gap-1.5 transition-all" style={inter}>
                      <TrendingUp className="w-3 h-3" /> View History
                    </span>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── How It Works ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {HOW_IT_WORKS.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} delay={i * 80}>
                <div className="group bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/40 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5 text-[#F97316]" />
                  </div>
                  <h3 className="font-semibold text-[#111827] dark:text-white text-sm mb-1.5" style={poppins}>{f.title}</h3>
                  <p className="text-xs text-[#6B7280] dark:text-gray-400 leading-relaxed" style={inter}>{f.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
