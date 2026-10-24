import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Flame, Timer, ChevronRight, Percent, Check, BarChart2 } from "lucide-react";
import type { Product } from "../lib/api";
import { isProductShot, imgFit } from "../data/products";

export default function DealsCarousel({
  deals,
  countdown,
  onCompare,
  poppins,
  inter,
}: {
  deals: Product[];
  countdown: { h: number; m: number; s: number };
  onCompare: (name: string) => void;
  poppins: React.CSSProperties;
  inter: React.CSSProperties;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const total = deals.length;
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const goNext = () => setActiveIdx(i => (total === 0 ? 0 : (i + 1) % total));
  const goPrev = () => setActiveIdx(i => (total === 0 ? 0 : (i - 1 + total) % total));

  useEffect(() => {
    if (isHovered || total === 0) return;
    const t = setInterval(goNext, 3200);
    return () => clearInterval(t);
  }, [isHovered, total]);

  const getCardStyle = (offset: number) => {
    const abs = Math.abs(offset);
    if (abs === 0) return { scale: 1,    blur: 0, opacity: 1,    zIndex: 20 };
    if (abs === 1) return { scale: 0.88, blur: 2, opacity: 0.65, zIndex: 10 };
                   return { scale: 0.78, blur: 4, opacity: 0.3,  zIndex: 5  };
  };

  return (
    <section
      className="py-14 bg-[#0C1320] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 mb-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#F97316]/15 rounded-xl flex items-center justify-center ring-1 ring-[#F97316]/20">
                <Flame className="w-4 h-4 text-[#F97316]" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#F97316] uppercase tracking-widest leading-none mb-1" style={inter}>{t("dealsPage.flashSale")}</p>
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight" style={poppins}>{t("home.dealsCarouselTitle")}</h2>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl">
              <Timer className="w-3.5 h-3.5 text-[#F97316] flex-shrink-0" />
              <div className="flex items-center gap-0.5 tabular-nums" style={poppins}>
                {[
                  { val: String(countdown.h).padStart(2, "0"), sep: ":" },
                  { val: String(countdown.m).padStart(2, "0"), sep: ":" },
                  { val: String(countdown.s).padStart(2, "0"), sep: "" },
                ].map((c, i) => (
                  <span key={i} className="flex items-center gap-0.5">
                    <span className="text-sm font-bold text-white">{c.val}</span>
                    {c.sep && <span className="text-[#F97316] font-bold text-sm">{c.sep}</span>}
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-gray-500 ml-0.5" style={inter}>{t("dealsPage.left")}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={goPrev}
              className="w-9 h-9 rounded-xl bg-white/8 hover:bg-[#F97316]/20 border border-white/10 hover:border-[#F97316]/40 text-gray-400 hover:text-[#F97316] flex items-center justify-center transition-all duration-200"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
            <button
              onClick={goNext}
              className="w-9 h-9 rounded-xl bg-white/8 hover:bg-[#F97316]/20 border border-white/10 hover:border-[#F97316]/40 text-gray-400 hover:text-[#F97316] flex items-center justify-center transition-all duration-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate("/deals")} className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#F97316] hover:text-orange-400 transition-colors" style={inter}>
              {t("common.viewAll")} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel stage */}
      <div className="relative flex items-center justify-center" style={{ height: 430 }}>
        {deals.map((deal, i) => {
          const raw = (i - activeIdx) % total;
          const offset = raw > total / 2 ? raw - total : raw < -(total / 2) ? raw + total : raw;
          if (Math.abs(offset) > 2) return null;
          const { scale, blur, opacity, zIndex } = getCardStyle(offset);
          const isCenter = offset === 0;
          const outOfStock = deal.dealStock === 0;

          return (
            <div
              key={deal._id}
              onClick={() => !isCenter && setActiveIdx(i)}
              style={{
                position: "absolute",
                width: 272,
                transform: `translateX(${offset * 310}px) scale(${scale})`,
                filter: `blur(${blur}px)`,
                opacity,
                zIndex,
                transition: "transform 440ms cubic-bezier(0.34, 1.18, 0.64, 1), opacity 440ms ease, filter 440ms ease",
                cursor: isCenter ? "default" : "pointer",
              }}
            >
              {/* Orange glow halo */}
              {isCenter && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 16,
                    boxShadow: "0 0 70px 14px rgba(249,115,22,0.2), 0 32px 64px rgba(0,0,0,0.55)",
                    pointerEvents: "none",
                  }}
                />
              )}

              <div
                className="relative bg-[#111827] rounded-2xl overflow-hidden flex flex-col"
                style={{
                  border: isCenter ? "1px solid rgba(249,115,22,0.35)" : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: isCenter
                    ? "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(249,115,22,0.15)"
                    : "0 8px 24px rgba(0,0,0,0.3)",
                }}
              >
                {/* Image */}
                <div className={`relative h-44 overflow-hidden ${isProductShot(deal.image) ? "bg-white" : "bg-white/5"} flex-shrink-0`}>
                  <img
                    src={deal.image}
                    alt={deal.name}
                    className={`w-full h-full ${imgFit(deal.image)} transition-transform duration-700 ${isCenter ? "hover:scale-105" : ""}`}
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-0.5 px-2.5 py-1 bg-[#F97316] text-white text-xs font-bold rounded-lg shadow-lg shadow-orange-900/40">
                      <Percent className="w-2.5 h-2.5" />−{deal.discount}%
                    </span>
                  </div>
                  <div
                    className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-md"
                    style={{ backgroundColor: deal.dealStoreColor }}
                  >
                    {deal.dealStore}
                  </div>
                  {!outOfStock && deal.dealLimited && (deal.dealStock ?? 0) <= 15 && (
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2 py-0.5 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-semibold rounded-md">
                        {t("dealsPage.onlyLeft", { count: deal.dealStock })}
                      </span>
                    </div>
                  )}
                  {outOfStock && (
                    <div className="absolute inset-0 bg-black/65 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold tracking-widest uppercase" style={poppins}>{t("dealsPage.soldOut")}</span>
                    </div>
                  )}
                  {isCenter && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#F97316] to-transparent" />
                  )}
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1" style={inter}>{deal.brand}</p>
                  <h3 className="text-sm font-semibold text-white leading-snug mb-3 line-clamp-2 flex-1" style={poppins}>{deal.name}</h3>

                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-2xl font-bold text-[#F97316]" style={poppins}>₹{deal.lowestPrice.toLocaleString("en-IN")}</span>
                    <span className="text-xs text-gray-500 line-through mb-0.5" style={inter}>₹{deal.originalPrice.toLocaleString("en-IN")}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold rounded-lg w-fit mb-4" style={inter}>
                    <Check className="w-2.5 h-2.5" />
                    {t("compare.saveAmount", { amount: (deal.originalPrice - deal.lowestPrice).toLocaleString("en-IN") })}
                  </span>

                  <button
                    disabled={outOfStock}
                    onClick={e => {
                      e.stopPropagation();
                      if (!outOfStock) onCompare(deal.name);
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 ${
                      outOfStock
                        ? "bg-white/5 text-gray-600 cursor-not-allowed"
                        : isCenter
                        ? "bg-[#F97316] hover:bg-orange-500 text-white shadow-lg shadow-orange-900/30 hover:-translate-y-0.5"
                        : "bg-white/10 text-white/70 border border-white/10 cursor-default"
                    }`}
                    style={poppins}
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    {outOfStock ? t("search.outOfStock") : t("dealsPage.comparePrice")}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile countdown */}
      <div className="sm:hidden mt-8 flex flex-col items-center px-4">
        <div className="flex items-center gap-2 px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl">
          <Timer className="w-3.5 h-3.5 text-[#F97316]" />
          <span className="text-xs text-gray-400" style={inter}>{t("home.endsIn")}</span>
          <div className="flex items-center gap-0.5 tabular-nums" style={poppins}>
            {[
              { val: String(countdown.h).padStart(2, "0"), sep: ":" },
              { val: String(countdown.m).padStart(2, "0"), sep: ":" },
              { val: String(countdown.s).padStart(2, "0"), sep: "" },
            ].map((c, i) => (
              <span key={i} className="flex items-center gap-0.5">
                <span className="text-sm font-bold text-white">{c.val}</span>
                {c.sep && <span className="text-[#F97316] font-bold">{c.sep}</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
