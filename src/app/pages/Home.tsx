import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import {
  Sparkles, ArrowRight, ChevronRight, SlidersHorizontal, ChevronDown,
  Search, Mic, Star, Users, BadgeCheck, Plus, Minus,
  Bot, ShieldCheck, Award, Zap,
} from "lucide-react";
import { inter, poppins } from "../lib/fonts";
import { TRENDING, WHY_FEATURES } from "../data/products";
import DealsCarousel from "../components/DealsCarousel";
import TrendingCard from "../components/TrendingCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Reveal from "../components/Reveal";
import { useOutletContext } from "react-router";
import type { AppContext } from "../Layout";
import { useProducts, useCategories, useRetailers, useTestimonials, useFaqs } from "../hooks/useApi";
import { CATEGORY_ICONS } from "../lib/icons";
import { localizedTestimonial, localizedFaq } from "../lib/i18nContent";

const BRAND_LOGOS = [
  { name: "Apple", slug: "apple" },
  { name: "Samsung", slug: "samsung" },
  { name: "Sony", slug: "sony" },
  { name: "OnePlus", slug: "oneplus" },
  { name: "Dell", slug: "dell" },
  { name: "LG", slug: "lg" },
  { name: "boAt", slug: "boat" },
  { name: "Xiaomi", slug: "xiaomi" },
  { name: "Lenovo", slug: "lenovo" },
  { name: "Asus", slug: "asus" },
  { name: "HP", slug: "hp" },
  { name: "Bose", slug: "bose" },
  { name: "JBL", slug: "jbl" },
  { name: "Garmin", slug: "garmin" },
  { name: "NVIDIA", slug: "nvidia" },
  { name: "PlayStation", slug: "playstation" },
];

export default function Home() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { dark, setDark, wishlisted, toggleWish, onLoginRequired, user, logout, cartCount, addToCart } = useOutletContext<AppContext>();

  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [countdown, setCountdown] = useState({ h: 4, m: 23, s: 47 });

  const { data: allProducts } = useProducts({ limit: 50 });
  const { data: trendingProducts } = useProducts({ tag: "trending" });
  const { data: deals } = useProducts({ tag: "deal" });
  const { data: categories } = useCategories();
  const { data: retailers } = useRetailers();
  const { data: testimonials } = useTestimonials();
  const { data: faqs } = useFaqs();

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

  const quickAddToCart = (p: (typeof trendingProducts)[number]) => {
    const best = [...p.stores].sort((a, b) => a.price - b.price)[0];
    addToCart({ productId: p._id, storeName: best?.name ?? "Amazon", priceSnapshot: best?.price ?? p.lowestPrice, name: p.name, image: p.image });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0e1f] transition-colors duration-300" style={inter}>
      <Navbar dark={dark} setDark={setDark} onLoginRequired={onLoginRequired} user={user} onLogout={logout} cartCount={cartCount} wishlistCount={wishlisted.size} />

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-orange-50/70 dark:from-[#0a0e1f] to-white dark:to-[#0a0e1f]">
        {/* ambient glow blobs */}
        <div className="pointer-events-none absolute -top-24 -right-10 w-[420px] h-[420px] rounded-full bg-[#F97316]/10 dark:bg-[#F97316]/20 blur-3xl" />
        <div className="pointer-events-none absolute top-52 -left-24 w-[360px] h-[360px] rounded-full bg-purple-400/10 dark:bg-purple-600/20 blur-3xl" />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-10 xl:gap-16 items-center">

            {/* ── LEFT: headline + search ── */}
            <div className="relative text-center lg:text-left max-w-2xl mx-auto lg:mx-0 lg:py-10 w-full min-w-0">

              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-white/5 border border-orange-200 dark:border-orange-900 rounded-full text-sm font-medium text-orange-600 dark:text-orange-400 mb-7 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                {t("home.heroBadge")}
              </div>

              {/* Headline */}
              <h1
                className="text-4xl sm:text-5xl lg:text-[3.75rem] font-bold text-[#111827] dark:text-white leading-[1.15] tracking-tight mb-5"
                style={poppins}
              >
                {t("home.heroTitle1")}
                <br />
                <span className="text-[#F97316]">
                  {t("home.heroTitle2")}
                </span>
              </h1>

              <p
                className="text-lg text-[#6B7280] dark:text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                style={inter}
              >
                {t("home.heroSubtitle")}
              </p>

              {/* Search bar */}
              <div className="relative max-w-2xl mx-auto lg:mx-0 mb-5">
            <div
              className={`flex items-center bg-white dark:bg-[#131B2E] border-2 transition-all duration-200 shadow-lg overflow-visible rounded-2xl ${
                showSuggestions && query.length > 0
                  ? "border-[#F97316] dark:border-[#F97316] rounded-b-none"
                  : "border-[#E5E7EB] dark:border-white/10 hover:border-orange-300 dark:hover:border-orange-700 focus-within:border-[#F97316]"
              }`}
            >
              <div className="pl-5 pr-3 text-[#9CA3AF] flex-shrink-0">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() =>
                  setTimeout(
                    () => setShowSuggestions(false),
                    150,
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query.trim().length > 0) {
                    navigate(`/search?q=${encodeURIComponent(query)}`);
                    setShowSuggestions(false);
                  }
                }}
                placeholder={t("home.searchPlaceholder")}
                className="flex-1 py-4 text-sm text-[#111827] dark:text-white placeholder-[#9CA3AF] bg-transparent outline-none min-w-0"
                style={inter}
              />
              {/* Voice button */}
              <button
                className="p-2 mr-1 text-[#9CA3AF] hover:text-[#F97316] transition-colors flex-shrink-0 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/40"
                title={t("home.voiceSearch")}
              >
                <Mic className="w-4 h-4" />
              </button>
              <button onClick={() => navigate(`/search?q=${encodeURIComponent(query)}`)} className="m-2 px-5 py-3 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-orange-200 flex-shrink-0">
                {t("common.compare")} <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions &&
              query.trim().length > 0 &&
              (() => {
                const filtered = allProducts
                  .filter((p) =>
                    p.name.toLowerCase().includes(query.toLowerCase()),
                  )
                  .slice(0, 8)
                  .map((p) => ({ label: p.name, category: p.category }));
                return filtered.length > 0 ? (
                  <div className="absolute top-full left-0 right-0 bg-white dark:bg-[#131B2E] border-2 border-t-0 border-[#F97316] dark:border-[#F97316] rounded-b-2xl shadow-xl z-40 overflow-hidden">
                    {filtered.map((s, i) => (
                      <button
                        key={s.label}
                        onMouseDown={() => {
                          setQuery(s.label);
                          setShowSuggestions(false);
                        }}
                        className={`w-full flex items-center justify-between px-5 py-3.5 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors text-left ${
                          i < filtered.length - 1
                            ? "border-b border-[#F3F4F6] dark:border-white/5"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Search className="w-3.5 h-3.5 text-[#9CA3AF] flex-shrink-0" />
                          <span
                            className="text-sm text-[#111827] dark:text-white"
                            style={inter}
                          >
                            {s.label
                              .split(
                                new RegExp(`(${query})`, "gi"),
                              )
                              .map((part, j) =>
                                part.toLowerCase() ===
                                query.toLowerCase() ? (
                                  <span
                                    key={j}
                                    className="text-[#F97316] font-semibold"
                                  >
                                    {part}
                                  </span>
                                ) : (
                                  part
                                ),
                              )}
                          </span>
                        </div>
                        <span
                          className="text-xs text-[#9CA3AF] bg-[#F3F4F6] dark:bg-white/10 px-2.5 py-1 rounded-lg flex-shrink-0"
                          style={inter}
                        >
                          {s.category}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null;
              })()}
          </div>

              {/* Trust badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6">
                {[
                  { icon: Users, label: t("home.trustBadges.retailers") },
                  { icon: Zap, label: t("home.trustBadges.realTime") },
                  { icon: Bot, label: t("home.trustBadges.aiRecommendations") },
                  { icon: ShieldCheck, label: t("home.trustBadges.verifiedDeals") },
                ].map(b => (
                  <span key={b.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-white/5 border border-[#E5E7EB] dark:border-white/10 rounded-full text-xs font-medium text-[#374151] dark:text-gray-300" style={inter}>
                    <b.icon className="w-3.5 h-3.5 text-[#F97316]" /> {b.label}
                  </span>
                ))}
              </div>

              {/* Trending chips */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-10 relative">
                <span
                  className="text-sm text-[#9CA3AF] font-medium py-1"
                  style={inter}
                >
                  {t("home.trendingLabel")}
                </span>
                {TRENDING.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="text-sm text-[#6B7280] dark:text-gray-400 hover:text-[#F97316] dark:hover:text-[#F97316] hover:bg-orange-50 dark:hover:bg-orange-950/40 px-3.5 py-1.5 rounded-lg border border-[#E5E7EB] dark:border-white/10 hover:border-orange-200 dark:hover:border-orange-800 transition-all duration-150"
                    style={inter}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* ── RIGHT: product visual + floating cards ── */}
            <div className="hidden lg:block relative h-[460px]">

              {/* Live Price Comparison card */}
              <div className="absolute top-0 right-0 w-64 p-4 bg-white dark:bg-[#131b2e] border border-[#E5E7EB] dark:border-white/10 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/40 z-20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#111827] dark:text-white" style={poppins}>{t("home.livePriceComparison")}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> {t("home.live")}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {retailers.slice(0, 4).map((r, i) => (
                    <div key={r._id} className="flex items-center justify-between text-xs">
                      <span className="text-[#6B7280] dark:text-gray-400" style={inter}>{r.name}</span>
                      <span className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#111827] dark:text-white" style={poppins}>
                          ₹{(129900 + i * 600 - (i === 1 ? 1500 : 0)).toLocaleString("en-IN")}
                        </span>
                        {i === 1 && <span className="px-1.5 py-0.5 bg-orange-50 dark:bg-orange-950/40 text-[#F97316] text-[9px] font-bold rounded">{t("home.best")}</span>}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-[#F3F4F6] dark:border-white/10 flex items-center justify-between">
                  <span className="text-[10px] text-[#9CA3AF]" style={inter}>{t("home.youSave")}</span>
                  <span className="text-sm font-bold text-emerald-500" style={poppins}>₹1,500</span>
                </div>
              </div>

              {/* Central device stack */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[#F97316]/20 to-purple-500/20 dark:from-[#F97316]/30 dark:to-purple-600/30 blur-2xl" />
                  <img
                    src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop&auto=format"
                    alt=""
                    className="absolute top-2 left-2 w-36 h-36 rounded-2xl object-cover shadow-2xl border-4 border-white dark:border-[#131b2e] -rotate-6"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=200&h=200&fit=crop&auto=format"
                    alt=""
                    className="absolute bottom-4 right-2 w-28 h-28 rounded-2xl object-cover shadow-2xl border-4 border-white dark:border-[#131b2e] rotate-6"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=140&h=140&fit=crop&auto=format"
                    alt=""
                    className="absolute top-24 right-0 w-16 h-16 rounded-xl object-cover shadow-xl border-2 border-white dark:border-[#131b2e] rotate-3"
                  />
                </div>
              </div>

              {/* Why Choose Us card */}
              <div className="absolute top-[13.5rem] -right-4 w-56 p-4 bg-white dark:bg-[#131b2e] border border-[#E5E7EB] dark:border-white/10 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/40 z-20">
                <span className="text-xs font-semibold text-[#111827] dark:text-white" style={poppins}>{t("home.whyChooseUsCard")}</span>
                <div className="mt-2.5 space-y-2">
                  {[
                    { icon: Zap, label: t("home.whyChooseUsCardItems.aiIntel") },
                    { icon: BadgeCheck, label: t("home.whyChooseUsCardItems.verifiedRetailers") },
                    { icon: Star, label: t("home.whyChooseUsCardItems.realRatings") },
                    { icon: ShieldCheck, label: t("home.whyChooseUsCardItems.securePurchase") },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-2">
                      <f.icon className="w-3.5 h-3.5 text-[#F97316] flex-shrink-0" />
                      <span className="text-[11px] text-[#6B7280] dark:text-gray-400" style={inter}>{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured Deal card */}
              {deals.slice(0, 1).map(deal => (
                <div key={deal._id} className="absolute bottom-0 left-0 w-60 p-4 bg-white dark:bg-[#131b2e] border border-[#E5E7EB] dark:border-white/10 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/40 z-20">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-bold text-[#F97316] uppercase tracking-wide flex items-center gap-1" style={inter}>
                      {t("home.featuredDeal")}
                    </span>
                    <span className="text-[9px] font-semibold text-white bg-[#111827] dark:bg-white/10 px-1.5 py-0.5 rounded">{t("home.limitedTime")}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <img src={deal.image.replace(/w=\d+&h=\d+/, "w=64&h=64")} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#111827] dark:text-white truncate" style={poppins}>{deal.name}</p>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-sm font-bold text-[#111827] dark:text-white" style={poppins}>₹{deal.lowestPrice.toLocaleString("en-IN")}</span>
                        <span className="text-[10px] text-[#9CA3AF] line-through">₹{deal.originalPrice.toLocaleString("en-IN")}</span>
                        <span className="text-[10px] font-bold text-emerald-500">{deal.discount}% OFF</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/compare/${encodeURIComponent(deal.name)}`)} className="w-full py-2 bg-[#F97316] hover:bg-orange-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:-translate-y-0.5" style={poppins}>
                    {t("home.viewDeal")} <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Brand strip — auto-scrolling logo marquee */}
          <div className="mt-16 lg:mt-10 pt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="flex w-max animate-marquee">
              {[...BRAND_LOGOS, ...BRAND_LOGOS].map((b, i) => (
                <img
                  key={`${b.slug}-${i}`}
                  src={`https://cdn.simpleicons.org/${b.slug}/9CA3AF`}
                  alt={b.name}
                  title={b.name}
                  className="h-8 w-auto mx-8 flex-shrink-0 opacity-70 dark:opacity-50 hover:opacity-100 transition-opacity duration-200"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          EXPLORE TOP ELECTRONICS — CATEGORY GRID
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0a0e1f]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-[#F97316] uppercase tracking-widest mb-2" style={inter}>{t("home.shopByCategory")}</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] dark:text-white mb-2" style={poppins}>{t("home.exploreTopElectronics")}</h2>
            <p className="text-[#6B7280] dark:text-gray-400 text-sm max-w-md mx-auto" style={inter}>{t("home.exploreSubtitle")}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map(cat => {
              const Icon = CATEGORY_ICONS[cat.iconName];
              return (
                <button
                  key={cat._id}
                  onClick={() => navigate("/categories")}
                  className="group relative flex flex-col items-center gap-3 p-6 bg-[#F8FAFC] dark:bg-[#131b2e] border border-[#E5E7EB] dark:border-white/10 rounded-2xl hover:shadow-xl hover:-translate-y-1 hover:border-transparent transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(ellipse at 50% 30%, ${cat.color}25 0%, transparent 70%)` }} />
                  <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: dark ? cat.darkBg : cat.bg }}>
                    <Icon className="w-7 h-7" style={{ color: cat.color }} />
                  </div>
                  <div className="relative text-center">
                    <p className="text-sm font-semibold text-[#111827] dark:text-white" style={poppins}>{t(`categoryLabels.${cat.name}`, cat.name)}</p>
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5" style={inter}>{cat.count}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          TODAY'S BEST DEALS — PREMIUM CAROUSEL
      ══════════════════════════════════════════════════════════ */}
      <DealsCarousel
        deals={deals}
        countdown={countdown}
        onCompare={name => navigate(`/compare/${encodeURIComponent(name)}`)}
        poppins={poppins}
        inter={inter}
      />

      {/* ══════════════════════════════════════════════════════════
          AI ADVISOR PROMO BANNER
      ══════════════════════════════════════════════════════════ */}
      <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-20 bg-white dark:bg-[#0a0e1f]">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-[#111827] dark:bg-[#0a0e1f] border border-white/10 p-8 sm:p-12">
            <div className="absolute inset-0 opacity-60 pointer-events-none" style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(249,115,22,0.18) 0%, transparent 60%)" }} />
            <div className="relative grid lg:grid-cols-[1fr_auto] gap-10 items-center">
              <div>
                <p className="text-xs font-semibold text-[#F97316] uppercase tracking-widest mb-2" style={inter}>{t("home.aiAdvisorEyebrow")}</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3" style={poppins}>{t("home.aiAdvisorTitle")}</h2>
                <p className="text-sm text-gray-400 mb-6 max-w-md" style={inter}>{t("home.aiAdvisorSubtitle")}</p>
                <button onClick={() => navigate("/ai-advisor")} className="inline-flex items-center gap-2 px-6 py-3 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-900/40 mb-8" style={poppins}>
                  {t("home.tryAiAdvisor")} <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex flex-wrap gap-6">
                  {[
                    { icon: Sparkles, label: t("home.aiFeatureSmartSuggestions") },
                    { icon: SlidersHorizontal, label: t("home.aiFeatureCompareInstantly") },
                    { icon: Award, label: t("home.aiFeatureBestValueDeals") },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0"><f.icon className="w-4 h-4 text-[#F97316]" /></div>
                      <span className="text-xs text-gray-300" style={inter}>{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative w-40 h-40 rounded-3xl bg-gradient-to-br from-[#F97316] to-purple-600 flex items-center justify-center shadow-2xl shadow-orange-900/40">
                  <Bot className="w-16 h-16 text-white" />
                  <div className="absolute -inset-3 rounded-3xl border border-[#F97316]/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SUGGESTIONS & FEATURED — 2 rows of 4
      ══════════════════════════════════════════════════════════ */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0a0e1f] overflow-hidden">
        <div className="pointer-events-none absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-purple-400/0 dark:bg-purple-600/10 blur-3xl" />
        <div className="max-w-7xl mx-auto relative">
          <Reveal>
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="text-xs font-semibold text-[#F97316] uppercase tracking-widest mb-1" style={inter}>{t("home.curatedForYou")}</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white" style={poppins}>{t("home.suggestionsFeatured")}</h2>
                <p className="text-sm text-[#6B7280] dark:text-gray-400 mt-1" style={inter}>{t("home.aiSelectedPicks")}</p>
              </div>
              <button onClick={() => { navigate("/categories"); window.scrollTo(0,0); }} className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#F97316] hover:text-orange-600 hover:gap-2.5 transition-all duration-200" style={inter}>
                {t("common.browseAll")} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </Reveal>
          {/* Row 1 — 4 cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {trendingProducts.slice(0, 4).map((p, i) => (
              <Reveal key={p._id} delay={i * 60}>
                <div className="group bg-white dark:bg-[#131b2e] border border-[#E5E7EB] dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-orange-100 dark:hover:shadow-orange-950/40 hover:-translate-y-1.5 hover:scale-[1.02] hover:border-orange-200 dark:hover:border-orange-800/50 transition-all duration-300 flex flex-col cursor-pointer"
                  onClick={() => navigate(`/compare/${encodeURIComponent(p.name)}`)}>
                  <div className="relative bg-[#F8FAFC] dark:bg-white/5 h-36 overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-2 left-2"><span className="px-2 py-0.5 bg-[#F97316] text-white text-[10px] font-bold rounded-md">{p.badge}</span></div>
                    <div className="absolute top-2 right-2"><span className="px-2 py-0.5 bg-[#10B981] text-white text-[10px] font-bold rounded-md">{p.discount}%</span></div>
                  </div>
                  <div className="p-3.5 flex flex-col flex-1">
                    <p className="text-[10px] text-[#9CA3AF] mb-0.5 truncate" style={inter}>{p.brand}</p>
                    <h3 className="text-xs font-semibold text-[#111827] dark:text-white leading-snug mb-2 line-clamp-2 min-h-[2.1rem]" style={poppins}>{p.name}</h3>
                    <p className="text-sm font-bold text-[#111827] dark:text-white" style={poppins}>₹{p.lowestPrice.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          {/* Row 2 — next 4 cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {trendingProducts.slice(4, 8).map((p, i) => (
              <Reveal key={p._id} delay={i * 60}>
                <div className="group bg-white dark:bg-[#131b2e] border border-[#E5E7EB] dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-orange-100 dark:hover:shadow-orange-950/40 hover:-translate-y-1.5 hover:scale-[1.02] hover:border-orange-200 dark:hover:border-orange-800/50 transition-all duration-300 flex flex-col cursor-pointer"
                  onClick={() => navigate(`/compare/${encodeURIComponent(p.name)}`)}>
                  <div className="relative bg-[#F8FAFC] dark:bg-white/5 h-36 overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-2 left-2"><span className="px-2 py-0.5 bg-[#F97316] text-white text-[10px] font-bold rounded-md">{p.badge}</span></div>
                    <div className="absolute top-2 right-2"><span className="px-2 py-0.5 bg-[#10B981] text-white text-[10px] font-bold rounded-md">{p.discount}%</span></div>
                  </div>
                  <div className="p-3.5 flex flex-col flex-1">
                    <p className="text-[10px] text-[#9CA3AF] mb-0.5 truncate" style={inter}>{p.brand}</p>
                    <h3 className="text-xs font-semibold text-[#111827] dark:text-white leading-snug mb-2 line-clamp-2 min-h-[2.1rem]" style={poppins}>{p.name}</h3>
                    <p className="text-sm font-bold text-[#111827] dark:text-white" style={poppins}>₹{p.lowestPrice.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          TRENDING PRODUCTS — 2 rows of 4
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC] dark:bg-[#0a0e1f]">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-semibold text-[#F97316] uppercase tracking-widest mb-2 flex items-center gap-1.5" style={inter}>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" /> {t("home.livePricesEyebrow")}
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white" style={poppins}>{t("home.trendingProducts")}</h2>
                <p className="text-sm text-[#6B7280] dark:text-gray-400 mt-1" style={inter}>{t("home.realTimeLowest")}</p>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] dark:border-white/10 rounded-xl text-sm font-medium text-[#374151] dark:text-gray-300 hover:border-orange-300 hover:text-[#F97316] hover:-translate-y-0.5 transition-all" style={inter}>
                  <SlidersHorizontal className="w-3.5 h-3.5" /> {t("common.filter")}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] dark:border-white/10 rounded-xl text-sm font-medium text-[#374151] dark:text-gray-300 hover:border-orange-300 hover:text-[#F97316] hover:-translate-y-0.5 transition-all" style={inter}>
                  {t("common.sort")} <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Reveal>
          {/* Row 1 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-5">
            {trendingProducts.slice(0, 4).map((p, i) => (
              <Reveal key={p._id} delay={i * 60}>
                <TrendingCard product={p} wishlisted={wishlisted.has(p._id)} onToggleWishlist={() => toggleWish(p._id)} onCompare={() => navigate(`/compare/${encodeURIComponent(p.name)}`)} onAddToCart={() => quickAddToCart(p)} />
              </Reveal>
            ))}
          </div>
          {/* Row 2 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {trendingProducts.slice(4, 8).map((p, i) => (
              <Reveal key={p._id} delay={i * 60}>
                <TrendingCard product={p} wishlisted={wishlisted.has(p._id)} onToggleWishlist={() => toggleWish(p._id)} onCompare={() => navigate(`/compare/${encodeURIComponent(p.name)}`)} onAddToCart={() => quickAddToCart(p)} />
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="text-center mt-10">
              <button onClick={() => { navigate(`/compare/${encodeURIComponent(trendingProducts[0]?.name ?? "")}`); window.scrollTo(0,0); }} className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-[#E5E7EB] dark:border-white/10 rounded-2xl text-sm font-semibold text-[#374151] dark:text-gray-300 hover:border-[#F97316] hover:text-[#F97316] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200" style={poppins}>
                {t("common.viewAllProducts")} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FREQUENTLY SEARCHED
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC] dark:bg-[#0a0e1f]">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-8">
              <p className="text-xs font-semibold text-[#F97316] uppercase tracking-widest mb-1" style={inter}>{t("home.whatPeopleSearching")}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white" style={poppins}>{t("home.frequentlySearched")}</h2>
            </div>
          </Reveal>
          <div className="space-y-5">
            {[
              { label: t("home.searchGroups.smartphones"), terms: ["iPhone 16 Pro", "Samsung Galaxy S25", "OnePlus 13", "Google Pixel 9", "Nothing Phone 3"] },
              { label: t("home.searchGroups.laptops"), terms: ["MacBook Air M3", "Dell XPS 15", "HP Spectre x360", "Lenovo ThinkPad X1", "ASUS ROG Zephyrus"] },
              { label: t("home.searchGroups.audio"), terms: ["Sony WH-1000XM5", "AirPods Pro 2", "Bose QuietComfort 45", "JBL Flip 6", "Sennheiser HD 560S"] },
              { label: t("home.searchGroups.accessories"), terms: ["Apple Watch Ultra 2", "Samsung Galaxy Watch 7", "Fitbit Charge 6", "iPad Pro M4", "Steam Deck OLED"] },
            ].map(({ label, terms }, gi) => (
              <Reveal key={label} delay={gi * 80}>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider w-24 flex-shrink-0" style={inter}>{label}</span>
                  <div className="flex flex-wrap gap-2">
                    {terms.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 text-sm text-[#374151] dark:text-gray-300 rounded-full hover:border-[#F97316] hover:text-[#F97316] hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 shadow-sm"
                        style={inter}
                      >
                        <Search className="w-3 h-3 text-[#9CA3AF]" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          S1 — TRUSTED RETAILERS
      ══════════════════════════════════════════════════════════ */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC] dark:bg-[#0a0e1f] overflow-hidden">
        <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-[#F97316]/0 dark:bg-[#F97316]/5 blur-3xl" />
        <div className="max-w-5xl mx-auto text-center relative">
          <Reveal>
            <p className="text-xs font-semibold text-[#F97316] uppercase tracking-widest mb-3" style={inter}>{t("home.retailNetworkEyebrow")}</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white mb-3" style={poppins}>{t("home.trustedRetailers")}</h2>
            <p className="text-sm text-[#6B7280] dark:text-gray-400 mb-10 max-w-md mx-auto" style={inter}>
              {t("home.retailerSubtitle")}
            </p>
          </Reveal>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mb-6">
            {retailers.map((r, i) => (
              <Reveal key={r._id} delay={i * 60}>
                <div className="group flex flex-col items-center gap-3 p-5 bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl hover:shadow-xl hover:-translate-y-1.5 hover:border-transparent transition-all duration-300 cursor-pointer relative overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{ background: `radial-gradient(ellipse at 50% 0%, ${r.color}25 0%, transparent 70%)` }} />
                  <div className="relative w-12 h-12 rounded-xl bg-[#F3F4F6] dark:bg-white/5 flex items-center justify-center text-sm font-bold text-[#6B7280] dark:text-gray-400 group-hover:scale-110 transition-all duration-300" style={{ ...poppins, ...(true ? { color: r.color } : {}) }}>
                    {r.abbr}
                  </div>
                  <span className="relative text-xs font-medium text-[#6B7280] dark:text-gray-400 group-hover:text-[#374151] dark:group-hover:text-gray-200 text-center leading-tight transition-colors" style={inter}>{r.name}</span>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="flex flex-wrap justify-center gap-5 text-xs text-[#9CA3AF] dark:text-gray-500" style={inter}>
              {[t("home.retailBadges.livePriceTracking"), t("home.retailBadges.verifiedSellers"), t("home.retailBadges.updated15"), t("home.retailBadges.majorRetailers")].map(label => (
                <span key={label} className="flex items-center gap-1.5"><BadgeCheck className="w-3.5 h-3.5 text-[#10B981]" />{label}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════
          S8 — WHY CHOOSE SUGGESTIONSFORYOU
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 dark:bg-[#0a0e1f]">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <p className="text-xs font-semibold text-[#F97316] uppercase tracking-widest mb-2" style={inter}>{t("home.ourEdge")}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white" style={poppins}>{t("home.whyChooseTitle")}</h2>
              <p className="text-sm text-[#6B7280] dark:text-gray-400 mt-2 max-w-md mx-auto" style={inter}>
                {t("home.whyChooseSubtitle")}
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_FEATURES.map((f, i) => {
              const Icon = f.icon;
              const tf = t(`home.whyFeatures.${i}`, { returnObjects: true }) as { title: string; desc: string };
              return (
                <Reveal key={f.title} delay={i * 60}>
                  <div className="group p-6 bg-[#F8FAFC] dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl hover:shadow-lg hover:shadow-orange-100 dark:hover:shadow-orange-950/30 hover:border-orange-200 dark:hover:border-orange-800/50 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-12 h-12 bg-orange-50 dark:bg-orange-950/40 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-orange-100 dark:group-hover:bg-orange-950/60 group-hover:scale-110 transition-all duration-300">
                      <Icon className="w-5 h-5 text-[#F97316]" />
                    </div>
                    <h3 className="font-semibold text-[#111827] dark:text-white mb-2" style={poppins}>{tf?.title ?? f.title}</h3>
                    <p className="text-sm text-[#6B7280] dark:text-gray-400 leading-relaxed" style={inter}>{tf?.desc ?? f.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
          {/* Platform metrics */}
          <Reveal delay={200}>
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#E5E7EB] dark:bg-white/10 rounded-2xl overflow-hidden">
              {[
                { value: "< 15 min", label: t("home.metrics.priceRefresh")    },
                { value: "2,300+",   label: t("home.metrics.productsIndexed") },
                { value: "99.9%",    label: t("home.metrics.uptimeSla")       },
                { value: "₹180Cr+",  label: t("home.metrics.savingsUnlocked") },
              ].map(m => (
                <div key={m.label} className="group bg-white dark:bg-[#131B2E] p-6 text-center hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-colors duration-300">
                  <div className="text-2xl font-bold text-[#111827] dark:text-white mb-1 group-hover:text-[#F97316] transition-colors" style={poppins}>{m.value}</div>
                  <div className="text-xs text-[#9CA3AF]" style={inter}>{m.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          S9 — CUSTOMER REVIEWS
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC] dark:bg-[#0a0e1f]">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-50 dark:bg-orange-950/50 border border-orange-100 dark:border-orange-900 rounded-full text-sm font-medium text-orange-600 dark:text-orange-400 mb-4" style={inter}>
                <Users className="w-3.5 h-3.5" /> {t("home.happyShoppers")}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white" style={poppins}>{t("home.whatUsersSay")}</h2>
              <p className="text-sm text-[#6B7280] dark:text-gray-400 mt-2" style={inter}>{t("home.reviewsSubtitle")}</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((item, i) => {
              const lt = localizedTestimonial(item, i18n.language);
              return (
              <Reveal key={item._id} delay={i * 60}>
                <div className="p-6 bg-white dark:bg-[#131B2E] rounded-2xl border border-[#E5E7EB] dark:border-white/10 hover:shadow-xl hover:shadow-orange-100 dark:hover:shadow-orange-950/30 transition-all duration-300 hover:-translate-y-1 flex flex-col">
                  <div className="flex items-center gap-1 mb-3">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-[#F97316] text-[#F97316]" />)}
                  </div>
                  <p className="text-sm text-[#374151] dark:text-gray-300 leading-relaxed mb-5 flex-1" style={inter}>"{lt.text}"</p>
                  <div className="flex items-center justify-between pt-4 border-t border-[#F3F4F6] dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <img src={item.avatar} alt={item.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-[#111827] dark:text-white" style={poppins}>{item.name}</div>
                        <div className="text-xs text-[#9CA3AF]" style={inter}>{lt.role}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-[#10B981]">{item.saved}</div>
                      <div className="text-xs text-[#9CA3AF]" style={inter}>{t("home.saved")}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          S10 — FAQ ACCORDION
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 dark:bg-[#0a0e1f]">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <p className="text-xs font-semibold text-[#F97316] uppercase tracking-widest mb-2" style={inter}>{t("home.faqEyebrow")}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white" style={poppins}>{t("home.faqTitle")}</h2>
              <p className="text-sm text-[#6B7280] dark:text-gray-400 mt-2" style={inter}>{t("home.faqSubtitle")}</p>
            </div>
          </Reveal>
          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const lf = localizedFaq(faq, i18n.language);
              return (
              <Reveal key={i} delay={Math.min(i, 6) * 40}>
                <div className={`bg-white dark:bg-[#131B2E] border rounded-2xl overflow-hidden transition-all duration-300 ${openFaq === i ? "border-orange-200 dark:border-orange-800/50 shadow-lg" : "border-[#E5E7EB] dark:border-white/10 hover:shadow-sm"}`}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[#F8FAFC] dark:hover:bg-white/5 transition-colors"
                  >
                    <span className="text-sm font-semibold text-[#111827] dark:text-white pr-4 leading-snug" style={poppins}>{lf.q}</span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${openFaq === i ? "bg-[#F97316] text-white rotate-180" : "bg-[#F3F4F6] dark:bg-white/10 text-[#6B7280]"}`}>
                      {openFaq === i ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                  <div className={`grid transition-all duration-300 ease-out ${openFaq === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                      <div className="px-6 pb-5">
                        <div className="border-t border-[#E5E7EB] dark:border-white/10 pt-4">
                          <p className="text-sm text-[#6B7280] dark:text-gray-400 leading-relaxed" style={inter}>{lf.a}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
