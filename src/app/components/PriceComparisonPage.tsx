import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useOutletContext } from "react-router";
import { useTranslation } from "react-i18next";
import {
  ChevronRight, ExternalLink, Check, BarChart2, TrendingUp,
  Star, Shield, Lock, RefreshCw, BadgeCheck, Tag, Percent, Bot, ShoppingBag,
  Truck, SlidersHorizontal, ChevronDown, Zap, Heart, ThumbsUp, Clock, Users,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { inter, poppins } from "../lib/fonts";
import { DEFAULT_PRODUCT, getProductImage, imgFit, imgBox } from "../data/products";
import { useProduct } from "../hooks/useApi";
import PHTooltip from "./PHTooltip";
import Reveal from "./Reveal";
import type { AppContext } from "../Layout";

export default function PriceComparisonPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ productName: string }>();
  const productName = params.productName ? decodeURIComponent(params.productName) : DEFAULT_PRODUCT;
  const { data: product, loading } = useProduct(productName);
  const productImage = product?.image ?? getProductImage(productName, 400);
  const { addToCart, wishlisted, toggleWish } = useOutletContext<AppContext>();
  const onBack = () => navigate("/");
  const [activeTab, setActiveTab] = useState<"30d" | "90d" | "1y">("90d");
  const [specsOpen, setSpecsOpen] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [addedStore, setAddedStore] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 340);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0a0e1f]" style={inter}>
        <p className="text-sm text-[#9CA3AF]">{t("compare.loadingProduct")}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F8FAFC] dark:bg-[#0a0e1f]" style={inter}>
        <p className="text-[#111827] dark:text-white font-semibold">{t("compare.productNotFound")}</p>
        <button onClick={onBack} className="px-5 py-2.5 bg-[#F97316] text-white rounded-xl text-sm font-semibold">{t("compare.backToHome")}</button>
      </div>
    );
  }

  const lowestPrice = Math.min(...product.stores.map(s => s.price));
  const highestPrice = Math.max(...product.stores.map(s => s.price));
  const priceRange = highestPrice - lowestPrice || 1;
  const rows = product.stores
    .map(s => ({ ...s, best: s.price === lowestPrice }))
    .sort((a, b) => a.price - b.price);
  const bestRow = rows.find(r => r.best) ?? rows[0];

  const specs = product.specs;
  const priceHistory = product.priceHistory;
  const chartData = activeTab === "30d" ? priceHistory["30d"] : activeTab === "90d" ? priceHistory["90d"] : priceHistory["1y"];
  const allPoints = [...priceHistory["30d"], ...priceHistory["90d"], ...priceHistory["1y"]];
  const allValues = allPoints.flatMap(p => [p.amazon, p.flipkart, p.croma]);
  const allTimeLow = allValues.length ? Math.min(...allValues) : lowestPrice;
  const allTimeHigh = allValues.length ? Math.max(...allValues) : highestPrice;
  const latest = chartData[chartData.length - 1];

  const handleAddToCart = (row: { name: string; price: number }) => {
    addToCart({ productId: product._id, storeName: row.name, priceSnapshot: row.price, name: product.name, image: product.image });
    setAddedStore(row.name);
    setTimeout(() => setAddedStore(null), 1500);
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] dark:bg-[#0a0e1f] transition-colors duration-300 overflow-hidden" style={inter}>
      <div className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-[#F97316]/0 dark:bg-[#F97316]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-96 -left-24 w-[360px] h-[360px] rounded-full bg-purple-400/0 dark:bg-purple-600/10 blur-3xl" />

      {/* ── Top Nav Bar ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 border-b border-[#E5E7EB] dark:border-white/10 bg-white/95 dark:bg-[#0a0e1f]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-[#6B7280] hover:text-[#F97316] hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all duration-200 flex-shrink-0"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <Link to="/" aria-label="SuggestionsForYou" className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity">
            <img src="/logo-80.png" alt="SuggestionsForYou" className="w-7 h-7 rounded-lg object-cover shadow-sm" />
            <span className="font-bold text-[#111827] dark:text-white text-sm hidden sm:block" style={poppins}>SuggestionsForYou</span>
          </Link>
          <span className="text-[#D1D5DB] dark:text-white/20 hidden sm:block">/</span>
          <span className="text-sm text-[#6B7280] dark:text-gray-400 truncate hidden sm:block" style={inter}>{t("compare.breadcrumb")}</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-[#10B981] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 px-2.5 py-1 rounded-full font-medium" style={inter}>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" />
              {t("compare.live")}
            </span>
            <span className="hidden sm:block text-xs text-[#9CA3AF]" style={inter}>{t("compare.updatedMinAgo")}</span>
          </div>
        </div>
      </div>

      {/* ── Sticky Summary Bar (appears after scrolling past hero) ── */}
      <div className={`sticky top-14 z-40 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-xl border-b border-[#E5E7EB] dark:border-white/10 transition-all duration-300 ${stickyVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-8 h-8 rounded-lg overflow-hidden ${imgBox(productImage)} border border-[#E5E7EB] dark:border-white/10 flex-shrink-0`}>
              <img src={productImage} alt="" className={`w-full h-full ${imgFit(productImage, "p-0.5")}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#111827] dark:text-white truncate" style={poppins}>{productName}</p>
              <p className="text-xs text-[#9CA3AF]" style={inter}>{t("compare.bestLabel")} <span className="text-[#F97316] font-bold">₹{bestRow.price.toLocaleString("en-IN")}</span> {t("compare.onStoreSave", { store: bestRow.name, amount: (bestRow.originalPrice - bestRow.price).toLocaleString("en-IN") })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => handleAddToCart(bestRow)} className="px-4 py-2 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 hover:shadow-md hover:shadow-orange-200/60 hover:-translate-y-0.5" style={poppins}>
              {addedStore === bestRow.name ? t("compare.added") : <>{t("compare.addToCart")} <ExternalLink className="w-3 h-3" /></>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 relative">

        {/* ── Product Hero Card ──────────────────────────────────── */}
        <Reveal>
        <div className="bg-white dark:bg-[#131B2E] rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-sm hover:shadow-lg dark:hover:shadow-orange-950/20 transition-shadow duration-300 overflow-hidden">
          {/* orange accent top strip */}
          <div className="h-1 bg-gradient-to-r from-[#F97316] via-orange-400 to-amber-400" />
          <div className="p-5 sm:p-7 flex flex-col sm:flex-row gap-5 sm:gap-7">
            {/* Product image */}
            <div className="relative flex-shrink-0 self-start">
              <div className={`w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden ${imgBox(productImage)} border border-[#E5E7EB] dark:border-white/10 shadow-sm`}>
                <img
                  src={productImage}
                  alt={productName}
                  className={`w-full h-full ${imgFit(productImage)} hover:scale-105 transition-transform duration-500`}
                />
              </div>
              {product.badge && <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-[#F97316] text-white text-[10px] font-bold rounded-full shadow-sm">{product.badge}</span>}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-100 dark:border-emerald-900">
                  <Check className="w-3 h-3" /> {t("compare.inStock")}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-lg border border-blue-100 dark:border-blue-900">
                  <BarChart2 className="w-3 h-3" /> {t("compare.retailersCount", { count: rows.length })}
                </span>
                {product.discount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 dark:bg-orange-950/40 text-[#F97316] text-xs font-semibold rounded-lg border border-orange-100 dark:border-orange-900">
                    <TrendingUp className="w-3 h-3" /> {t("compare.belowMrp", { discount: product.discount })}
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-white leading-snug mb-1" style={poppins}>{productName}</h1>
              <p className="text-sm text-[#9CA3AF] mb-3" style={inter}>{product.brand} · {t(`categoryLabels.${product.category}`, product.category)}</p>

              <div className="flex items-center gap-2 mb-4">
                {product.reviews > 0 ? (
                  <>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= Math.round(product.rating) ? "fill-[#F97316] text-[#F97316]" : "fill-gray-200 text-gray-200 dark:fill-white/10 dark:text-white/10"}`} />)}
                    </div>
                    <span className="text-sm font-semibold text-[#374151] dark:text-gray-300" style={inter}>{product.rating}</span>
                    <span className="text-sm text-[#9CA3AF]" style={inter}>{t("compare.reviewsCount", { count: product.reviews.toLocaleString() })}</span>
                  </>
                ) : (
                  <span className="text-sm text-[#9CA3AF]" style={inter}>{t("compare.noReviews")}</span>
                )}
                <span className="text-[#E5E7EB] dark:text-white/20">·</span>
                <span className="text-xs text-[#9CA3AF]" style={inter}>{t("compare.verifiedOn", { store: bestRow.name })}</span>
              </div>

              {/* Price block */}
              <div className="flex flex-wrap items-end gap-5 mb-5">
                <div>
                  <p className="text-xs text-[#9CA3AF] mb-0.5 uppercase tracking-wide font-medium" style={inter}>{t("compare.bestPriceToday")}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-bold text-[#F97316]" style={poppins}>₹{bestRow.price.toLocaleString("en-IN")}</span>
                    {bestRow.originalPrice > bestRow.price && (
                      <span className="text-base text-[#9CA3AF] line-through" style={inter}>₹{bestRow.originalPrice.toLocaleString("en-IN")}</span>
                    )}
                  </div>
                </div>
                <div className="pb-1">
                  <p className="text-xs text-[#9CA3AF] mb-0.5 uppercase tracking-wide font-medium" style={inter}>{t("compare.youSave")}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[#10B981]" style={poppins}>₹{(bestRow.originalPrice - bestRow.price).toLocaleString("en-IN")}</span>
                    <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-100 dark:border-emerald-900">
                      {t("compare.percentOff", { percent: Math.round((bestRow.originalPrice - bestRow.price) / bestRow.originalPrice * 100) })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Shield, label: t("compare.trust.verifiedSeller") },
                  { icon: Lock, label: t("compare.trust.secureCheckout") },
                  { icon: RefreshCw, label: t("compare.trust.priceRefresh15") },
                  { icon: BadgeCheck, label: t("compare.trust.genuineProduct") },
                ].map(ti => {
                  const Icon = ti.icon;
                  return (
                    <span key={ti.label} className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-gray-400" style={inter}>
                      <Icon className="w-3.5 h-3.5 text-[#10B981]" />{ti.label}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* CTA column */}
            <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0 sm:w-44">
              <button
                onClick={() => handleAddToCart(bestRow)}
                className="flex-1 sm:flex-none px-5 py-3 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-200/60 dark:hover:shadow-orange-900/50 whitespace-nowrap"
                style={poppins}
              >
                {addedStore === bestRow.name ? t("compare.addedToCart") : <>{t("compare.addToCart")} <ExternalLink className="w-3.5 h-3.5" /></>}
              </button>
              <button
                onClick={() => toggleWish(product._id)}
                className="hidden sm:flex px-5 py-2.5 bg-[#F8FAFC] dark:bg-white/5 hover:bg-[#F3F4F6] dark:hover:bg-white/10 border border-[#E5E7EB] dark:border-white/10 text-[#374151] dark:text-gray-300 rounded-xl text-sm font-semibold items-center justify-center gap-2 transition-all duration-200 whitespace-nowrap"
                style={inter}
              >
                <Heart className={`w-3.5 h-3.5 ${wishlisted.has(product._id) ? "fill-red-500 text-red-500" : ""}`} /> {wishlisted.has(product._id) ? t("compare.wishlisted") : t("compare.wishlist")}
              </button>
            </div>
          </div>
        </div>
        </Reveal>

        {/* ── Summary Stats Strip ────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t("compare.stats.lowestPrice"),   value: `₹${lowestPrice.toLocaleString("en-IN")}`, sub: t("compare.stats.onStore", { store: bestRow.name }),     color: "text-[#F97316]",  bg: "bg-white dark:bg-[#131B2E]",           border: "border-orange-100 dark:border-orange-900/40", icon: Tag       },
            { label: t("compare.stats.youSave"),       value: `₹${(bestRow.originalPrice - lowestPrice).toLocaleString("en-IN")}`, sub: t("compare.stats.percentOffMrp", { percent: Math.round((bestRow.originalPrice - lowestPrice) / bestRow.originalPrice * 100) }), color: "text-[#10B981]", bg: "bg-white dark:bg-[#131B2E]", border: "border-emerald-100 dark:border-emerald-900/40", icon: Percent },
            { label: t("compare.stats.priceRange"),    value: t("compare.stats.gapK", { k: Math.round(priceRange / 1000) }),  sub: t("compare.stats.acrossRetailers"),       color: "text-blue-500",   bg: "bg-white dark:bg-[#131B2E]",           border: "border-blue-100 dark:border-blue-900/40",     icon: BarChart2 },
            { label: t("compare.stats.aiConfidence"),  value: product.aiScore ? t("compare.stats.matchPercent", { score: product.aiScore }) : t("compare.stats.buyNow"), sub: product.aiReason ?? t("compare.stats.aiScoredRecommendation"), color: "text-purple-600", bg: "bg-white dark:bg-[#131B2E]",           border: "border-purple-100 dark:border-purple-900/40", icon: Bot       },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.label} delay={i * 60}>
                <div className={`${s.bg} rounded-2xl p-4 border ${s.border} shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide" style={inter}>{s.label}</p>
                    <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                  </div>
                  <p className={`text-lg font-bold ${s.color} leading-tight`} style={poppins}>{s.value}</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5" style={inter}>{s.sub}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* ── Retailer Comparison Table ──────────────────────────── */}
        <Reveal>
        <div className="bg-white dark:bg-[#131B2E] rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-[#E5E7EB] dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-bold text-[#111827] dark:text-white text-base" style={poppins}>{t("compare.retailerComparison")}</h2>
              <p className="text-xs text-[#9CA3AF] mt-0.5" style={inter}>{t("compare.refreshNote")}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#10B981] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 px-2.5 py-1 rounded-full font-medium" style={inter}>
                <RefreshCw className="w-3 h-3" /> {t("compare.updatedMinAgo")}
              </span>
            </div>
          </div>

          {/* Mobile cards (< md) */}
          <div className="md:hidden divide-y divide-[#F3F4F6] dark:divide-white/5">
            {rows.map(row => (
              <div key={row.name} className={`p-4 ${row.best ? "bg-orange-50/60 dark:bg-orange-950/15" : "hover:bg-[#F8FAFC] dark:hover:bg-white/5"} transition-colors`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 border" style={{ backgroundColor: `${row.color}15`, borderColor: `${row.color}30`, color: row.color }}>{row.abbr}</div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-semibold text-[#111827] dark:text-white" style={inter}>{row.name}</span>
                        {row.best && <span className="px-1.5 py-0.5 bg-[#F97316] text-white text-[10px] font-bold rounded-md">{t("compare.bestValue")}</span>}
                        {!row.inStock && <span className="px-1.5 py-0.5 bg-red-50 dark:bg-red-950/40 text-red-500 text-[10px] font-semibold rounded-md border border-red-100">{t("compare.outOfStock")}</span>}
                        {row.verified && <BadgeCheck className="w-3.5 h-3.5 text-[#10B981]" />}
                        {row.url && (
                          <a href={row.url} target="_blank" rel="noopener noreferrer" title={t("compare.viewRealListing")} className="text-[#9CA3AF] hover:text-[#F97316]">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {row.reviews > 0 ? (
                          <>
                            <Star className="w-3 h-3 fill-[#F97316] text-[#F97316]" />
                            <span className="text-xs text-[#6B7280]" style={inter}>{row.rating} ({row.reviews.toLocaleString()})</span>
                          </>
                        ) : (
                          <span className="text-xs text-[#9CA3AF]" style={inter}>—</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-lg font-bold ${row.best ? "text-[#F97316]" : "text-[#111827] dark:text-white"}`} style={poppins}>₹{row.price.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-[#10B981] font-semibold">{t("compare.saveAmount", { amount: (row.originalPrice - row.price).toLocaleString("en-IN") })}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 text-xs text-[#6B7280] dark:text-gray-400 bg-[#F8FAFC] dark:bg-white/5 px-2.5 py-1 rounded-lg">
                    <Truck className="w-3 h-3 text-[#10B981]" />{row.deliveryLabel} · {row.deliveryTime}
                  </span>
                  {row.offer && <span className="text-xs text-[#374151] dark:text-gray-300 bg-[#F8FAFC] dark:bg-white/5 px-2.5 py-1 rounded-lg">{row.offer}</span>}
                  {row.cashback && <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 px-2.5 py-1 rounded-lg border border-purple-100 dark:border-purple-900 font-medium">{row.cashback}</span>}
                  {row.coupon && <span className="text-xs text-[#F97316] bg-orange-50 dark:bg-orange-950/40 px-2.5 py-1 rounded-lg border border-orange-200 dark:border-orange-800 font-mono font-semibold">{row.coupon}</span>}
                </div>
                <button disabled={!row.inStock} onClick={() => handleAddToCart(row)}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${!row.inStock ? "bg-[#F3F4F6] dark:bg-white/5 text-[#9CA3AF] cursor-not-allowed" : row.best ? "bg-[#F97316] hover:bg-orange-600 text-white hover:shadow-md hover:shadow-orange-200/60 hover:-translate-y-0.5" : "border border-[#E5E7EB] dark:border-white/10 text-[#374151] dark:text-gray-300 hover:border-[#F97316] hover:text-[#F97316]"}`}
                  style={poppins}>
                  {!row.inStock ? t("compare.outOfStock") : addedStore === row.name ? t("compare.added") : <><ShoppingBag className="w-4 h-4" />{t("compare.addToCart")}</>}
                </button>
              </div>
            ))}
          </div>

          {/* Desktop table (>= md) */}
          <div className="hidden md:block overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-white/[0.03] border-b border-[#E5E7EB] dark:border-white/10">
                  <th className="px-5 py-3 text-left text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider w-52" style={inter}>{t("compare.table.retailer")}</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider" style={inter}>{t("compare.table.price")}</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider" style={inter}>{t("compare.table.savings")}</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider" style={inter}>{t("compare.table.delivery")}</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider" style={inter}>{t("compare.table.offersCashback")}</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider" style={inter}>{t("compare.table.rating")}</th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider" style={inter}>{t("compare.table.action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6] dark:divide-white/5">
                {rows.map(row => (
                  <tr key={row.name} className={`group transition-colors duration-150 ${row.best ? "bg-orange-50/50 dark:bg-orange-950/10" : "hover:bg-[#F8FAFC] dark:hover:bg-white/[0.03]"}`}>

                    {/* Retailer */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 transition-transform group-hover:scale-105" style={{ backgroundColor: `${row.color}15`, color: row.color }}>
                          {row.abbr}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-semibold text-[#111827] dark:text-white" style={inter}>{row.name}</span>
                            {row.verified && <span title={t("compare.trust.verifiedSeller")}><BadgeCheck className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" /></span>}
                            {row.url && (
                              <a href={row.url} target="_blank" rel="noopener noreferrer" title={t("compare.viewRealListing")} className="text-[#9CA3AF] hover:text-[#F97316]">
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {row.best && <span className="px-1.5 py-0.5 bg-[#F97316] text-white text-[10px] font-bold rounded-md leading-none">{t("compare.bestValue")}</span>}
                            {row.lowestEver && <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold rounded-md border border-emerald-100 dark:border-emerald-900 leading-none">{t("compare.lowestEver")}</span>}
                            {!row.inStock && <span className="px-1.5 py-0.5 bg-red-50 dark:bg-red-950/40 text-red-500 text-[10px] font-semibold rounded-md border border-red-100 leading-none">{t("compare.outOfStock")}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <span className={`text-base font-bold ${row.best ? "text-[#F97316]" : "text-[#111827] dark:text-white"}`} style={poppins}>
                          ₹{row.price.toLocaleString("en-IN")}
                        </span>
                        {/* price bar */}
                        <div className="w-24 h-1 bg-[#F3F4F6] dark:bg-white/10 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${row.best ? "bg-[#F97316]" : "bg-[#D1D5DB] dark:bg-white/30"}`}
                            style={{ width: `${Math.max(20, 100 - ((row.price - lowestPrice) / priceRange) * 80)}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#9CA3AF] line-through mt-0.5 block">₹{row.originalPrice.toLocaleString("en-IN")}</span>
                      </div>
                    </td>

                    {/* Savings */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-[#10B981]" style={poppins}>₹{(row.originalPrice - row.price).toLocaleString("en-IN")}</span>
                      <span className="block text-xs text-[#9CA3AF] mt-0.5">{t("compare.percentOff", { percent: Math.round((row.originalPrice - row.price) / row.originalPrice * 100) })}</span>
                    </td>

                    {/* Delivery */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Truck className={`w-3.5 h-3.5 flex-shrink-0 ${row.deliveryLabel === "Free Delivery" ? "text-[#10B981]" : "text-[#9CA3AF]"}`} />
                        <div>
                          <span className={`text-xs font-medium block ${row.deliveryLabel === "Free Delivery" ? "text-[#10B981]" : "text-[#9CA3AF]"}`} style={inter}>{row.deliveryLabel}</span>
                          <span className="text-xs text-[#9CA3AF]" style={inter}>{t("compare.inTime", { time: row.deliveryTime })}</span>
                        </div>
                      </div>
                    </td>

                    {/* Offers & Cashback */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1.5">
                        {row.offer && (
                          <span className="text-xs text-[#374151] dark:text-gray-300 whitespace-nowrap flex items-center gap-1" style={inter}>
                            <Tag className="w-3 h-3 text-[#9CA3AF]" />{row.offer}
                          </span>
                        )}
                        {row.cashback && (
                          <span className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 px-2 py-0.5 rounded-md border border-purple-100 dark:border-purple-900 font-medium w-fit whitespace-nowrap" style={inter}>
                            <Percent className="w-2.5 h-2.5" />{row.cashback}
                          </span>
                        )}
                        {row.coupon && (
                          <span className="inline-block text-xs text-[#F97316] bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 px-2 py-0.5 rounded-md font-mono font-semibold w-fit whitespace-nowrap">
                            {row.coupon}
                          </span>
                        )}
                        {!row.offer && !row.cashback && !row.coupon && <span className="text-xs text-[#D1D5DB]">{t("compare.noOffers")}</span>}
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {row.reviews > 0 ? (
                        <>
                          <div className="flex items-center gap-1 mb-0.5">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} className={`w-3 h-3 ${i <= Math.round(row.rating) ? "fill-[#F97316] text-[#F97316]" : "fill-[#E5E7EB] text-[#E5E7EB]"}`} />
                            ))}
                            <span className="text-xs font-semibold text-[#374151] dark:text-gray-300 ml-0.5" style={inter}>{row.rating}</span>
                          </div>
                          <span className="text-[10px] text-[#9CA3AF]" style={inter}>{t("compare.reviewsShort", { count: row.reviews.toLocaleString() })}</span>
                        </>
                      ) : (
                        <span className="text-xs text-[#9CA3AF]" style={inter}>—</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-4 text-right">
                      <button
                        disabled={!row.inStock}
                        onClick={() => handleAddToCart(row)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                          !row.inStock
                            ? "bg-[#F3F4F6] dark:bg-white/5 text-[#9CA3AF] cursor-not-allowed"
                            : row.best
                            ? "bg-[#F97316] hover:bg-orange-600 text-white shadow-sm hover:shadow-orange-200/60 hover:-translate-y-0.5 hover:shadow-md"
                            : "border border-[#E5E7EB] dark:border-white/10 text-[#374151] dark:text-gray-300 hover:border-[#F97316] hover:text-[#F97316] hover:bg-orange-50 dark:hover:bg-orange-950/20"
                        }`}
                        style={poppins}
                      >
                        {!row.inStock ? t("compare.outOfStock") : addedStore === row.name ? t("compare.added") : <><ShoppingBag className="w-3 h-3" />{t("compare.addToCart")}</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-5 py-3 bg-[#F8FAFC] dark:bg-white/[0.02] border-t border-[#E5E7EB] dark:border-white/10 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#F97316] flex-shrink-0" />
              <span className="text-xs text-[#6B7280] dark:text-gray-400" style={inter}>
                <span className="font-semibold text-[#F97316]">{t("compare.aiPrefix")}</span> {product.aiReason ?? t("compare.aiDefaultReason", { store: bestRow.name })}
              </span>
            </div>
            <div className="flex items-center gap-3 sm:ml-auto flex-shrink-0">
              {[{ icon: Shield, label: t("compare.verified") }, { icon: Lock, label: t("compare.secure") }].map(vi => {
                const Icon = vi.icon;
                return (
                  <span key={vi.label} className="inline-flex items-center gap-1 text-xs text-[#9CA3AF]" style={inter}>
                    <Icon className="w-3 h-3 text-[#10B981]" />{vi.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
        </Reveal>

        {/* ── Price History Chart ────────────────────────────────── */}
        <Reveal>
        <div className="bg-white dark:bg-[#131B2E] rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-[#E5E7EB] dark:border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-[#111827] dark:text-white text-base" style={poppins}>{t("compare.priceHistory")}</h2>
                <p className="text-xs text-[#9CA3AF] mt-0.5" style={inter}>{t("compare.priceHistorySubtitle")}</p>
              </div>
              <div className="flex items-center gap-1 p-1 bg-[#F3F4F6] dark:bg-white/5 rounded-xl self-start">
                {([{ key: "30d", label: "30D" }, { key: "90d", label: "90D" }, { key: "1y", label: "1Y" }] as const).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === tab.key ? "bg-white dark:bg-[#0a0e1f] text-[#111827] dark:text-white shadow-sm" : "text-[#9CA3AF] hover:text-[#374151] dark:hover:text-gray-300"}`}
                    style={inter}
                  >{tab.label}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="px-2 sm:px-4 pt-4 pb-2">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart key={activeTab} data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="cpGradAmazon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor="#F97316" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#F97316" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.6} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF", fontFamily: "Inter, sans-serif" }} axisLine={false} tickLine={false} dy={8} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF", fontFamily: "Inter, sans-serif" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${Math.round(v / 1000)}K`} domain={["auto", "auto"]} width={52} />
                <Tooltip content={<PHTooltip />} cursor={{ stroke: "#F97316", strokeWidth: 1, strokeDasharray: "4 4" }} />
                <Area type="monotone" dataKey="amazon"   name="Amazon"   stroke="#F97316" strokeWidth={2.5} fill="url(#cpGradAmazon)" dot={false} activeDot={{ r: 5, fill: "#F97316", strokeWidth: 2, stroke: "#fff" }} />
                <Area type="monotone" dataKey="flipkart" name="Flipkart" stroke="#2874F0" strokeWidth={2}   fill="transparent" fillOpacity={0} dot={false} activeDot={{ r: 4, fill: "#2874F0", strokeWidth: 2, stroke: "#fff" }} />
                <Area type="monotone" dataKey="croma"    name="Croma"    stroke="#10B981" strokeWidth={2}   fill="transparent" fillOpacity={0} dot={false} activeDot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "#fff" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legend + insights */}
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
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: t("compare.allTimeLow"),  value: `₹${allTimeLow.toLocaleString("en-IN")}`,  color: "text-[#10B981]",  bg: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-100 dark:border-emerald-900/40" },
                { label: t("compare.allTimeHigh"), value: `₹${allTimeHigh.toLocaleString("en-IN")}`, color: "text-red-500",    bg: "bg-red-50 dark:bg-red-950/20",          border: "border-red-100 dark:border-red-900/40"         },
                { label: t("compare.current"),       value: `₹${latest.amazon.toLocaleString("en-IN")}`, color: "text-[#F97316]",  bg: "bg-orange-50 dark:bg-orange-950/20",    border: "border-orange-100 dark:border-orange-900/40"   },
              ].map(s => (
                <div key={s.label} className={`${s.bg} ${s.border} border rounded-xl p-3 text-center`}>
                  <p className={`text-sm font-bold ${s.color}`} style={poppins}>{s.value}</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5" style={inter}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        </Reveal>

        {/* ── Expandable Specifications ──────────────────────────── */}
        <Reveal>
        <div className="bg-white dark:bg-[#131B2E] rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-sm overflow-hidden">
          <button
            onClick={() => setSpecsOpen(v => !v)}
            className="w-full px-5 sm:px-6 py-4 flex items-center justify-between hover:bg-[#F8FAFC] dark:hover:bg-white/5 transition-colors duration-150"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-50 dark:bg-orange-950/40 rounded-xl flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4 text-[#F97316]" />
              </div>
              <div className="text-left">
                <h2 className="font-bold text-[#111827] dark:text-white text-base" style={poppins}>{t("compare.keySpecifications")}</h2>
                <p className="text-xs text-[#9CA3AF]" style={inter}>{specsOpen ? t("compare.clickToCollapse") : t("compare.clickToExpand")}</p>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${specsOpen ? "bg-[#F97316] text-white rotate-180" : "bg-[#F3F4F6] dark:bg-white/10 text-[#6B7280]"}`}>
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>
          <div className={`grid transition-all duration-300 ease-out ${specsOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
            <div className="overflow-hidden">
              <div className="border-t border-[#E5E7EB] dark:border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#F3F4F6] dark:divide-white/5">
                  {[specs.slice(0, Math.ceil(specs.length / 2)), specs.slice(Math.ceil(specs.length / 2))].map((col, ci) => (
                    <div key={ci} className="divide-y divide-[#F3F4F6] dark:divide-white/5">
                      {col.map(s => (
                        <div key={s.label} className="px-5 sm:px-6 py-3.5 flex gap-4 hover:bg-[#F8FAFC] dark:hover:bg-white/[0.03] transition-colors">
                          <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide w-28 flex-shrink-0 pt-0.5" style={inter}>{s.label}</span>
                          <span className="text-xs text-[#374151] dark:text-gray-300 leading-relaxed" style={inter}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        </Reveal>

        {/* ── AI Recommendation Banner ───────────────────────────── */}
        <Reveal>
        <div className="bg-gradient-to-br from-[#111827] via-[#161f31] to-[#111827] rounded-2xl p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F97316] rounded-full blur-3xl opacity-[0.06] -translate-y-1/2 translate-x-1/4 pointer-events-none animate-glow-pulse" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 bg-[#F97316]/20 rounded-2xl flex items-center justify-center flex-shrink-0 border border-[#F97316]/20">
              <Bot className="w-6 h-6 text-[#F97316]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-[#F97316] uppercase tracking-widest mb-1" style={inter}>{t("compare.aiPriceIntelligence")}</p>
              <p className="text-white text-sm leading-relaxed" style={inter}>
                {product.aiReason ?? t("compare.aiDefaultBanner", { store: bestRow.name, score: product.aiScore ?? 90 })}
              </p>
              <div className="flex flex-wrap gap-3 mt-3">
                {[{ icon: ThumbsUp, label: t("compare.accuracyPercent", { score: product.aiScore ?? 90 }) }, { icon: Clock, label: t("compare.updatedHourly") }, { icon: Users, label: t("compare.shoppersCount") }].map(ai => {
                  const Icon = ai.icon;
                  return (
                    <span key={ai.label} className="inline-flex items-center gap-1.5 text-xs text-gray-400" style={inter}>
                      <Icon className="w-3.5 h-3.5 text-[#F97316]" />{ai.label}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
              <button onClick={() => handleAddToCart(bestRow)} className="flex-1 sm:flex-none px-5 py-2.5 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-900/40" style={poppins}>
                <Zap className="w-4 h-4" /> {addedStore === bestRow.name ? t("compare.added") : t("compare.addToCart")}
              </button>
            </div>
          </div>
        </div>
        </Reveal>

      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
