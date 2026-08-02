import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  ChevronRight, Bot, BarChart2, Clock, Users, Zap, ShieldCheck,
} from "lucide-react";
import { inter, poppins } from "../lib/fonts";
import { useProducts } from "../hooks/useApi";
import AIProductCard from "../components/AIProductCard";
import Reveal from "../components/Reveal";

const HOW_AI_WORKS = [
  { icon: BarChart2, title: "Millions of price points", desc: "Our model continuously scans 50+ retailers, learning seasonal patterns and restock cycles across every category." },
  { icon: Zap, title: "Personalised to what you browse", desc: "Recommendations sharpen the more you search and compare — no two shoppers see the same picks." },
  { icon: ShieldCheck, title: "94% prediction accuracy", desc: "Backtested against 2+ years of historical pricing, so a 'buy now' call actually means something." },
];

export default function AIAdvisorPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: aiProducts } = useProducts({ tag: "aiPick" });
  const categories = useMemo(() => ["All", ...Array.from(new Set(aiProducts.map(p => p.category)))], [aiProducts]);
  const filtered = activeCategory === "All" ? aiProducts : aiProducts.filter(p => p.category === activeCategory);

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] dark:bg-[#0a0e1f] transition-colors duration-300 overflow-hidden" style={inter}>
      <div className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-purple-400/0 dark:bg-purple-600/10 blur-3xl" />
      <div className="pointer-events-none absolute top-96 -left-24 w-[360px] h-[360px] rounded-full bg-[#F97316]/0 dark:bg-[#F97316]/10 blur-3xl" />
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
          <span className="text-sm text-[#6B7280] dark:text-gray-400 hidden sm:block" style={inter}>AI Advisor</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 relative">
        {/* ── Hero ── */}
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950/40 rounded-2xl flex items-center justify-center mx-auto mb-5 animate-glow-pulse">
              <Bot className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-xs font-semibold text-[#F97316] uppercase tracking-widest mb-2" style={inter}>Let AI Pick For You</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] dark:text-white mb-3" style={poppins}>AI Advisor</h1>
            <p className="text-[#6B7280] dark:text-gray-400 text-sm mb-6" style={inter}>
              Get personalised product recommendations powered by our intelligent AI engine — ranked by real-time value, not just price.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { icon: ShieldCheck, label: "94% accuracy" },
                { icon: Clock, label: "Updated hourly" },
                { icon: Users, label: "2.4M shoppers" },
              ].map(chip => {
                const Icon = chip.icon;
                return (
                  <span key={chip.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-full text-xs font-medium text-[#374151] dark:text-gray-300 hover:border-orange-200 dark:hover:border-orange-800/50 hover:-translate-y-0.5 transition-all" style={inter}>
                    <Icon className="w-3.5 h-3.5 text-[#F97316]" /> {chip.label}
                  </span>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* ── Category Filter ── */}
        <Reveal>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                  activeCategory === c
                    ? "bg-[#F97316] border-[#F97316] text-white shadow-md shadow-orange-200 dark:shadow-orange-950/40 scale-105"
                    : "bg-white dark:bg-[#131B2E] border-[#E5E7EB] dark:border-white/10 text-[#374151] dark:text-gray-300 hover:border-[#F97316] hover:text-[#F97316] hover:-translate-y-0.5"
                }`}
                style={inter}
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>

        {/* ── AI Picks Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p, i) => (
            <Reveal key={p._id} delay={i * 60}>
              <AIProductCard product={p} onCompare={() => navigate(`/compare/${encodeURIComponent(p.name)}`)} />
            </Reveal>
          ))}
        </div>

        {/* ── How Our AI Works ── */}
        <div>
          <Reveal>
            <h2 className="text-xl font-bold text-[#111827] dark:text-white text-center mb-5" style={poppins}>How Our AI Works</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {HOW_AI_WORKS.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={i * 80}>
                  <div className="group bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-5 hover:shadow-lg hover:shadow-orange-100 dark:hover:shadow-orange-950/30 hover:-translate-y-1 transition-all duration-300">
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
    </div>
  );
}
