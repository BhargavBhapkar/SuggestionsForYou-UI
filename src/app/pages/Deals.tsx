import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import {
  ChevronRight, Flame, Timer, Percent, BarChart2, Check,
} from "lucide-react";
import { inter, poppins } from "../lib/fonts";
import { useProducts } from "../hooks/useApi";
import Reveal from "../components/Reveal";
import { imgFit, imgBox } from "../data/products";

const SORT_KEYS = ["discount", "price-low", "price-high"] as const;

export default function DealsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState({ h: 4, m: 23, s: 47 });
  const [sortBy, setSortBy] = useState<(typeof SORT_KEYS)[number]>("discount");
  const [storeFilter, setStoreFilter] = useState("All");

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { h, m, s } = prev;
        s--; if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 4; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: flashDeals } = useProducts({ tag: "deal" });

  const stores = useMemo(() => ["All", ...Array.from(new Set(flashDeals.map(d => d.dealStore).filter((s): s is string => !!s)))], [flashDeals]);

  const deals = useMemo(() => {
    let list = storeFilter === "All" ? flashDeals : flashDeals.filter(d => d.dealStore === storeFilter);
    list = [...list].sort((a, b) => {
      if (sortBy === "price-low") return a.lowestPrice - b.lowestPrice;
      if (sortBy === "price-high") return b.lowestPrice - a.lowestPrice;
      return b.discount - a.discount;
    });
    return list;
  }, [sortBy, storeFilter, flashDeals]);

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
          <Link to="/" aria-label="SuggestionsForYou" className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity">
            <img src="/logo-80.png" alt="SuggestionsForYou" className="w-7 h-7 rounded-lg object-cover shadow-sm" />
            <span className="font-bold text-[#111827] dark:text-white text-sm hidden sm:block" style={poppins}>SuggestionsForYou</span>
          </Link>
          <span className="text-[#D1D5DB] dark:text-white/20 hidden sm:block">/</span>
          <span className="text-sm text-[#6B7280] dark:text-gray-400 hidden sm:block" style={inter}>{t("dealsPage.title")}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 relative">
        {/* ── Hero ── */}
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-orange-50 dark:bg-orange-950/40 rounded-2xl flex items-center justify-center mx-auto mb-5 animate-glow-pulse">
              <Flame className="w-8 h-8 text-[#F97316]" />
            </div>
            <p className="text-xs font-semibold text-[#F97316] uppercase tracking-widest mb-2" style={inter}>{t("dealsPage.flashSale")}</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] dark:text-white mb-3" style={poppins}>{t("dealsPage.title")}</h1>
            <p className="text-[#6B7280] dark:text-gray-400 text-sm mb-6" style={inter}>
              {t("dealsPage.subtitle")}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-xl shadow-sm">
              <Timer className="w-4 h-4 text-[#F97316] flex-shrink-0" />
              <div className="flex items-center gap-0.5 tabular-nums" style={poppins}>
                {[
                  { val: String(countdown.h).padStart(2, "0"), sep: ":" },
                  { val: String(countdown.m).padStart(2, "0"), sep: ":" },
                  { val: String(countdown.s).padStart(2, "0"), sep: "" },
                ].map((c, i) => (
                  <span key={i} className="flex items-center gap-0.5">
                    <span className="text-sm font-bold text-[#111827] dark:text-white">{c.val}</span>
                    {c.sep && <span className="text-[#F97316] font-bold text-sm">{c.sep}</span>}
                  </span>
                ))}
              </div>
              <span className="text-xs text-[#9CA3AF] ml-0.5" style={inter}>{t("dealsPage.left")}</span>
            </div>
          </div>
        </Reveal>

        {/* ── Filters ── */}
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {stores.map(s => (
                <button
                  key={s}
                  onClick={() => setStoreFilter(s)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                    storeFilter === s
                      ? "bg-[#F97316] border-[#F97316] text-white shadow-md shadow-orange-200 dark:shadow-orange-950/40"
                      : "bg-white dark:bg-[#131B2E] border-[#E5E7EB] dark:border-white/10 text-[#374151] dark:text-gray-300 hover:border-[#F97316] hover:text-[#F97316] hover:-translate-y-0.5"
                  }`}
                  style={inter}
                >
                  {s === "All" ? t("dealsPage.all") : s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-xl self-start sm:self-auto">
              {SORT_KEYS.map(key => (
                <button
                  key={key}
                  onClick={() => setSortBy(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${sortBy === key ? "bg-[#F97316] text-white shadow-sm" : "text-[#6B7280] dark:text-gray-400 hover:text-[#374151] dark:hover:text-gray-200"}`}
                  style={inter}
                >
                  {key === "discount" ? t("dealsPage.sortDiscount") : t(`search.sortLabels.${key}`)}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── Deals Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {deals.map((deal, i) => {
            const outOfStock = !deal.dealLimited && deal.dealStock === 0;
            return (
              <Reveal key={deal._id} delay={Math.min(i, 7) * 50}>
                <div className="group bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-orange-100 dark:hover:shadow-orange-950/30 hover:-translate-y-1.5 transition-all duration-300 flex flex-col">
                  <div className={`relative h-40 ${imgBox(deal.image)} overflow-hidden flex-shrink-0`}>
                    <img src={deal.image} alt={deal.name} className={`w-full h-full ${imgFit(deal.image)} group-hover:scale-105 transition-transform duration-500`} />
                    <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-0.5 px-2 py-1 bg-[#F97316] text-white text-xs font-bold rounded-lg shadow">
                      <Percent className="w-2.5 h-2.5" />−{deal.discount}%
                    </span>
                    <span className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg text-[10px] font-bold text-white shadow" style={{ backgroundColor: deal.dealStoreColor }}>
                      {deal.dealStore}
                    </span>
                    {!outOfStock && deal.dealLimited && (deal.dealStock ?? 0) <= 15 && (
                      <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-semibold rounded-md animate-pulse">
                        {t("dealsPage.onlyLeft", { count: deal.dealStock })}
                      </span>
                    )}
                    {outOfStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-xs font-semibold tracking-widest uppercase" style={poppins}>{t("dealsPage.soldOut")}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-[10px] text-[#9CA3AF] uppercase tracking-widest mb-1" style={inter}>{deal.brand}</p>
                    <h3 className="text-sm font-semibold text-[#111827] dark:text-white leading-snug mb-3 line-clamp-2 flex-1" style={poppins}>{deal.name}</h3>
                    <div className="flex items-end gap-2 mb-3">
                      <span className="text-xl font-bold text-[#F97316]" style={poppins}>₹{deal.lowestPrice.toLocaleString("en-IN")}</span>
                      <span className="text-xs text-[#9CA3AF] line-through mb-0.5">₹{deal.originalPrice.toLocaleString("en-IN")}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold rounded-lg w-fit mb-4" style={inter}>
                      <Check className="w-2.5 h-2.5" />
                      {t("compare.saveAmount", { amount: (deal.originalPrice - deal.lowestPrice).toLocaleString("en-IN") })}
                    </span>
                    <button
                      disabled={outOfStock}
                      onClick={() => !outOfStock && navigate(`/compare/${encodeURIComponent(deal.name)}`)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 ${
                        outOfStock
                          ? "bg-[#F3F4F6] dark:bg-white/5 text-[#9CA3AF] cursor-not-allowed"
                          : "bg-[#F97316] hover:bg-orange-600 text-white hover:-translate-y-0.5 hover:shadow-md hover:shadow-orange-200"
                      }`}
                      style={poppins}
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      {outOfStock ? t("search.outOfStock") : t("dealsPage.comparePrice")}
                    </button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {deals.length === 0 && (
          <p className="text-center text-sm text-[#9CA3AF] py-12" style={inter}>{t("dealsPage.noDealsMatch")}</p>
        )}
      </div>
    </div>
  );
}
