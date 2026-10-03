import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, Heart, ExternalLink, ShoppingCart, Check } from "lucide-react";
import { inter, poppins } from "../lib/fonts";
import type { Product } from "../lib/api";

export default function TrendingCard({
  product, wishlisted, onToggleWishlist, onCompare, onAddToCart,
}: {
  product: Product;
  wishlisted: boolean;
  onToggleWishlist: () => void;
  onCompare?: () => void;
  onAddToCart?: () => void;
}) {
  const { t } = useTranslation();
  const [comparing, setComparing] = useState(false);
  const [added, setAdded] = useState(false);
  return (
    <div className="group bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="relative bg-[#F8FAFC] dark:bg-white/5 h-48 overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-[#F97316] text-white text-xs font-semibold rounded-lg">{product.badge}</span>
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <button onClick={onToggleWishlist} className="w-8 h-8 bg-white/90 dark:bg-[#131B2E]/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
            <Heart className={`w-4 h-4 transition-colors ${wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
          </button>
        </div>
        <div className="absolute bottom-3 right-3">
          <span className="px-2.5 py-1 bg-[#10B981] text-white text-xs font-bold rounded-lg">{t("search.offBadge", { percent: product.discount })}</span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-[#9CA3AF] mb-0.5 truncate" style={inter}>{product.brand} · {t(`categoryLabels.${product.category}`, product.category)}</p>
        <h3 className="font-semibold text-[#111827] dark:text-white text-sm leading-snug mb-2 line-clamp-2 min-h-[2.4rem]" style={poppins}>{product.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => <Star key={i} className={`w-3 h-3 ${i <= Math.floor(product.rating) ? "fill-[#F97316] text-[#F97316]" : "fill-gray-200 text-gray-200"}`} />)}
          </div>
          <span className="text-xs text-[#9CA3AF]" style={inter}>{product.rating} ({product.reviews.toLocaleString()})</span>
        </div>
        <div className="flex items-baseline gap-2 mb-4 mt-auto">
          <span className="text-xl font-bold text-[#111827] dark:text-white" style={poppins}>₹{product.lowestPrice.toLocaleString("en-IN")}</span>
          <span className="text-xs text-[#9CA3AF] line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex gap-1.5 sm:gap-2">
          <button onClick={() => onCompare?.()} className="flex-1 py-2.5 px-1 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-orange-200 min-w-0" style={poppins}>
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" /> <span className="hidden sm:inline truncate">{t("common.viewComparison")}</span>
          </button>
          <button
            onClick={() => { onAddToCart?.(); setAdded(true); setTimeout(() => setAdded(false), 1500); }}
            title={t("search.addToCart")}
            className={`px-2.5 sm:px-3 py-2.5 rounded-xl border transition-all flex-shrink-0 ${added ? "bg-emerald-500 border-emerald-500 text-white" : "border-[#E5E7EB] dark:border-white/10 text-[#374151] dark:text-gray-300 hover:border-[#F97316] hover:text-[#F97316]"}`}
          >
            {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setComparing(!comparing)}
            className={`px-2.5 sm:px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all flex-shrink-0 ${comparing ? "bg-[#111827] dark:bg-white text-white dark:text-[#111827] border-transparent" : "border-[#E5E7EB] dark:border-white/10 text-[#374151] dark:text-gray-300 hover:border-[#F97316] hover:text-[#F97316]"}`}
            style={inter}
          >
            {comparing ? "✓" : (
              <>
                <span className="sm:hidden">+</span>
                <span className="hidden sm:inline">{t("common.compareShort")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
