import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useOutletContext } from "react-router";
import { useTranslation } from "react-i18next";
import {
  Search, Mic, ArrowRight, Star, Heart, ExternalLink, Bot, Zap, Check,
  Bell, Menu, Moon, Sun, ChevronDown, ChevronRight, ChevronLeft,
  X, Eye, Plus, Minus, SlidersHorizontal, RefreshCw, Tag, Truck,
  LayoutGrid, List, Filter, Home, ShoppingCart, UserRound, LogOut,
} from "lucide-react";
import { DEFAULT_PRODUCT } from "./data/products";
import { useProducts } from "./hooks/useApi";
import Reveal from "./components/Reveal";
import LanguageSwitcher from "./components/LanguageSwitcher";
import type { AppContext } from "./Layout";

const NAV_PATHS: Record<string, string> = {
  home: "/", categories: "/categories", compare: `/compare/${encodeURIComponent(DEFAULT_PRODUCT)}`,
  priceHistory: "/price-history", aiAdvisor: "/ai-advisor",
  deals: "/deals", about: "/about",
};

// ─── Shared tokens ────────────────────────────────────────────────────────────
const pp: React.CSSProperties = { fontFamily: "'Poppins', sans-serif" };
const it: React.CSSProperties = { fontFamily: "'Inter', sans-serif"   };

// ─── Data ─────────────────────────────────────────────────────────────────────
interface Result {
  id: string; name: string; brand: string; category: string; image: string;
  rating: number; reviews: number; lowestPrice: number; originalPrice: number;
  discount: number; aiPick: boolean; bestOffer: string; delivery: string;
  inStock: boolean; storesCount: number; bestStoreName: string;
}

const FILTER_CATEGORIES = ["Mobiles", "Laptops", "Headphones", "Smart Watches", "Tablets", "Gaming", "Televisions", "Cameras", "Home Appliances"];
const FILTER_BRANDS     = ["Samsung", "Apple", "OnePlus", "Sony", "LG", "Lenovo", "Dell", "Canon", "GoPro", "Garmin", "boAt"];
const FILTER_OFFERS     = ["Bank Offers", "No Cost EMI", "Exchange Offer", "Cashback"];
const RECENT_SEARCHES   = ["Samsung Galaxy S25", "Samsung TV 65 inch", "Samsung Watch 7", "Samsung Tab S10"];
const SUGGESTIONS       = ["Samsung Galaxy S25 Ultra", "Samsung Galaxy A55", "Samsung QLED TV", "Samsung Buds 3 Pro", "Samsung Galaxy Book4"];
const RELATED_SEARCHES  = ["Samsung 5G phones under 50000", "Best Samsung TV deals", "Samsung vs iPhone comparison", "Samsung Galaxy foldable phone", "Samsung smartwatch price in India", "Samsung laptop latest"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Stars({ rating, sm = false }: { rating: number; sm?: boolean }) {
  const sz = sm ? "w-3 h-3" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`${sz} ${i <= Math.floor(rating) ? "fill-[#F97316] text-[#F97316]" : "fill-gray-200 text-gray-200"}`} />
      ))}
    </div>
  );
}

// Price range dual-thumb slider
function PriceSlider({ min, max, value, onChange }: {
  min: number; max: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
}) {
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  return (
    <div className="px-1">
      <div className="relative h-5 flex items-center">
        {/* Track */}
        <div className="absolute left-0 right-0 h-1.5 bg-[#E5E7EB] dark:bg-white/10 rounded-full" />
        {/* Fill */}
        <div
          className="absolute h-1.5 bg-[#F97316] rounded-full"
          style={{ left: `${pct(value[0])}%`, right: `${100 - pct(value[1])}%` }}
        />
        {/* Min thumb */}
        <input type="range" min={min} max={max} step={1000} value={value[0]}
          onChange={e => {
            const v = Number(e.target.value);
            if (v < value[1]) onChange([v, value[1]]);
          }}
          className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer range-thumb"
        />
        {/* Max thumb */}
        <input type="range" min={min} max={max} step={1000} value={value[1]}
          onChange={e => {
            const v = Number(e.target.value);
            if (v > value[0]) onChange([value[0], v]);
          }}
          className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer range-thumb"
        />
      </div>
      <div className="flex justify-between mt-2 text-xs font-medium text-[#374151] dark:text-gray-300" style={it}>
        <span>₹{(value[0]/1000).toFixed(0)}K</span>
        <span>₹{(value[1]/1000).toFixed(0)}K</span>
      </div>
    </div>
  );
}

// Quick View modal
function QuickViewModal({
  product, onClose, onCompare, onAddToCart,
}: {
  product: Result; onClose: () => void; onCompare: () => void; onAddToCart: () => void;
}) {
  const { t } = useTranslation();
  const [added, setAdded] = useState(false);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-[#131B2E] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-[#F3F4F6] dark:bg-white/10 rounded-xl flex items-center justify-center text-[#6B7280] hover:text-[#111827] dark:hover:text-white transition-colors z-10">
          <X className="w-4 h-4" />
        </button>
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-52 h-52 bg-[#F8FAFC] dark:bg-white/5 flex-shrink-0 overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-6 flex-1">
            <p className="text-xs text-[#9CA3AF] mb-1" style={it}>{product.brand} · {t(`categoryLabels.${product.category}`, product.category)}</p>
            <h3 className="text-lg font-bold text-[#111827] dark:text-white mb-3 leading-snug" style={pp}>{product.name}</h3>
            <div className="flex items-center gap-2 mb-4">
              <Stars rating={product.rating} />
              <span className="text-xs text-[#6B7280]" style={it}>{product.rating} ({product.reviews.toLocaleString()})</span>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-bold text-[#111827] dark:text-white" style={pp}>₹{product.lowestPrice.toLocaleString("en-IN")}</span>
              <span className="text-sm text-[#9CA3AF] line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
              <span className="text-xs font-bold text-[#10B981]">{t("search.offBadge", { percent: product.discount })}</span>
            </div>
            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2 text-xs text-[#374151] dark:text-gray-300" style={it}>
                <Truck className="w-3.5 h-3.5 text-[#10B981]" />{product.delivery}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#374151] dark:text-gray-300" style={it}>
                <Tag className="w-3.5 h-3.5 text-[#F97316]" />{product.bestOffer}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#374151] dark:text-gray-300" style={it}>
                <RefreshCw className="w-3.5 h-3.5 text-[#6B7280]" />{t("search.availableOnStores", { count: product.storesCount })}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={onCompare} className="flex-1 py-3 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5" style={pp}>
                {t("search.comparePrices")} <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { onAddToCart(); setAdded(true); setTimeout(() => setAdded(false), 1500); }}
                title={t("search.addToCart")}
                className={`px-4 py-3 border-2 rounded-xl text-sm font-semibold transition-all ${added ? "bg-emerald-500 border-emerald-500 text-white" : "border-[#F97316] text-[#F97316] hover:bg-orange-50 dark:hover:bg-orange-950/30"}`}
                style={pp}
              >
                {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              </button>
              <button className="px-4 py-3 border-2 border-[#E5E7EB] dark:border-white/10 text-[#6B7280] rounded-xl text-sm font-semibold hover:border-orange-300 hover:text-[#F97316] transition-all" style={pp}>
                <Bell className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Product card — grid mode
function GridCard({
  product, wishlisted, onToggleWish, comparing, onToggleCompare, onQuickView, onCompare, onAddToCart,
}: {
  product: Result; wishlisted: boolean; onToggleWish: () => void;
  comparing: boolean; onToggleCompare: () => void; onQuickView: () => void;
  onCompare: () => void; onAddToCart: () => void;
}) {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  return (
    <div
      className="group relative bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-orange-100 dark:hover:shadow-orange-950/30 hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative bg-[#F8FAFC] dark:bg-white/5 h-48 overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.aiPick && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-600 text-white text-xs font-semibold rounded-lg shadow-sm" style={it}>
              <Bot className="w-2.5 h-2.5" /> {t("search.aiPick")}
            </span>
          )}
          <span className="px-2 py-0.5 bg-[#F97316] text-white text-xs font-semibold rounded-lg shadow-sm" style={it}>
            {t("search.offBadge", { percent: product.discount })}
          </span>
        </div>

        {/* Wishlist */}
        <button
          onClick={onToggleWish}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 dark:bg-[#131B2E]/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
        >
          <Heart className={`w-4 h-4 transition-colors ${wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
        </button>

        {/* Quick View — hover reveal */}
        <div className={`absolute bottom-0 left-0 right-0 flex justify-center pb-3 transition-all duration-200 ${hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
          <button
            onClick={onQuickView}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/95 dark:bg-[#131B2E]/95 backdrop-blur-sm text-[#111827] dark:text-white text-xs font-semibold rounded-xl shadow-lg hover:bg-white transition-all"
            style={pp}
          >
            <Eye className="w-3.5 h-3.5" /> {t("search.quickView")}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-[#9CA3AF] mb-0.5" style={it}>{product.brand} · {t(`categoryLabels.${product.category}`, product.category)}</p>
        <h3 className="font-semibold text-[#111827] dark:text-white text-sm leading-snug mb-2" style={pp}>{product.name}</h3>

        <div className="flex items-center gap-2 mb-2">
          <Stars rating={product.rating} sm />
          <span className="text-xs text-[#9CA3AF]" style={it}>{product.rating} ({product.reviews.toLocaleString()})</span>
        </div>

        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-xl font-bold text-[#111827] dark:text-white" style={pp}>₹{product.lowestPrice.toLocaleString("en-IN")}</span>
          <span className="text-xs text-[#9CA3AF] line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
        </div>

        {/* Offer + Delivery row */}
        <div className="flex flex-col gap-1 mb-3 mt-auto">
          <span className="inline-flex items-center gap-1 text-xs text-[#F97316] font-medium" style={it}>
            <Tag className="w-3 h-3" />{product.bestOffer}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-[#10B981]" style={it}>
            <Truck className="w-3 h-3" />{product.delivery}
          </span>
          {!product.inStock && (
            <span className="text-xs text-red-500 font-medium" style={it}>{t("search.outOfStock")}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onCompare}
            className="flex-1 py-2.5 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!product.inStock}
            style={pp}
          >
            <ExternalLink className="w-3.5 h-3.5" /> {t("search.compare")}
          </button>
          <button
            onClick={() => { onAddToCart(); setAdded(true); setTimeout(() => setAdded(false), 1500); }}
            title={t("search.addToCart")}
            disabled={!product.inStock}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${added ? "bg-emerald-500 border-emerald-500 text-white" : "border-[#E5E7EB] dark:border-white/10 text-[#6B7280] hover:border-[#F97316] hover:text-[#F97316]"}`}
          >
            {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onToggleCompare}
            title={t("search.addToCompare")}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all text-xs font-bold ${comparing ? "bg-[#111827] dark:bg-white text-white dark:text-[#111827] border-transparent" : "border-[#E5E7EB] dark:border-white/10 text-[#6B7280] hover:border-[#F97316] hover:text-[#F97316]"}`}
          >
            {comparing ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Stores count */}
        <p className="text-xs text-[#9CA3AF] text-center mt-2" style={it}>
          {t("search.pricesFromStores", { count: product.storesCount })}
        </p>
      </div>
    </div>
  );
}

// Product card — list mode
function ListCard({
  product, wishlisted, onToggleWish, comparing, onToggleCompare, onQuickView, onCompare, onAddToCart,
}: {
  product: Result; wishlisted: boolean; onToggleWish: () => void;
  comparing: boolean; onToggleCompare: () => void; onQuickView: () => void;
  onCompare: () => void; onAddToCart: () => void;
}) {
  const { t } = useTranslation();
  const [added, setAdded] = useState(false);
  return (
    <div className="bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex">
      {/* Image */}
      <div className="relative w-36 sm:w-48 flex-shrink-0 bg-[#F8FAFC] dark:bg-white/5 overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
        {product.aiPick && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-600 text-white text-xs font-semibold rounded-lg" style={it}>
              <Bot className="w-2.5 h-2.5" /> {t("search.aiPick")}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#9CA3AF] mb-0.5" style={it}>{product.brand} · {t(`categoryLabels.${product.category}`, product.category)}</p>
          <h3 className="font-semibold text-[#111827] dark:text-white text-sm leading-snug mb-2" style={pp}>{product.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <Stars rating={product.rating} sm />
            <span className="text-xs text-[#9CA3AF]" style={it}>{product.rating} ({product.reviews.toLocaleString()})</span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <span className="text-xs text-[#F97316] font-medium flex items-center gap-1" style={it}>
              <Tag className="w-3 h-3" />{product.bestOffer}
            </span>
            <span className="text-xs text-[#10B981] flex items-center gap-1" style={it}>
              <Truck className="w-3 h-3" />{product.delivery}
            </span>
            {!product.inStock && <span className="text-xs text-red-500 font-medium" style={it}>{t("search.outOfStock")}</span>}
          </div>
        </div>

        {/* Price + Actions */}
        <div className="flex sm:flex-col items-center sm:items-end gap-3 flex-shrink-0">
          <div className="text-right">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-[#111827] dark:text-white" style={pp}>₹{product.lowestPrice.toLocaleString("en-IN")}</span>
              <span className="px-1.5 py-0.5 bg-[#10B981]/10 text-[#10B981] text-xs font-bold rounded-md">{product.discount}%</span>
            </div>
            <p className="text-xs text-[#9CA3AF] line-through text-right" style={it}>₹{product.originalPrice.toLocaleString("en-IN")}</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5 text-right" style={it}>{t("search.storesCount", { count: product.storesCount })}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onQuickView}
              className="p-2 border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#6B7280] hover:border-orange-300 hover:text-[#F97316] transition-all"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleWish}
              className="p-2 border border-[#E5E7EB] dark:border-white/10 rounded-xl hover:border-red-200 transition-all"
            >
              <Heart className={`w-4 h-4 transition-colors ${wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
            </button>
            <button
              onClick={() => { onAddToCart(); setAdded(true); setTimeout(() => setAdded(false), 1500); }}
              title={t("search.addToCart")}
              disabled={!product.inStock}
              className={`p-2 rounded-xl border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${added ? "bg-emerald-500 border-emerald-500 text-white" : "border-[#E5E7EB] dark:border-white/10 text-[#6B7280] hover:border-[#F97316] hover:text-[#F97316]"}`}
            >
              {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            </button>
            <button
              onClick={onCompare}
              className="px-4 py-2 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all hover:-translate-y-0.5 disabled:opacity-50"
              disabled={!product.inStock}
              style={pp}
            >
              {t("search.compare")} <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Filter Section accordion
function FilterSection({
  title, open, onToggle, children,
}: {
  title: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[#E5E7EB] dark:border-white/10 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left hover:text-[#F97316] transition-colors"
      >
        <span className="text-sm font-semibold text-[#111827] dark:text-white" style={pp}>{title}</span>
        <ChevronDown className={`w-4 h-4 text-[#6B7280] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function SearchResultsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { wishlisted, toggleWish, addToCart, dark, setDark, user, onLoginRequired, logout, cartCount } = useOutletContext<AppContext>();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialQuery = searchParams.get("q") || (initialCategory ? "" : "Samsung");
  const onNavigateHome = () => navigate("/");

  // Search
  const [query,           setQuery]           = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // UI state
  const [mobileMenu,      setMobileMenu]      = useState(false);
  const [mobileSidebar,   setMobileSidebar]   = useState(false);
  const [viewMode,        setViewMode]        = useState<"grid" | "list">("grid");
  const [sortBy,          setSortBy]          = useState("relevance");
  const [sortOpen,        setSortOpen]        = useState(false);
  const [scrolled,        setScrolled]        = useState(false);
  const [page,            setPage]            = useState(1);
  const [quickViewItem,   setQuickViewItem]   = useState<Result | null>(null);

  // Filters
  const [openFilters,   setOpenFilters]   = useState(new Set(["category", "brand", "price", "rating"]));
  const [selCategories, setSelCategories] = useState<Set<string>>(new Set(initialCategory ? [initialCategory] : []));
  const [selBrands,     setSelBrands]     = useState<Set<string>>(new Set());
  const [priceRange,    setPriceRange]    = useState<[number, number]>([5000, 200000]);
  const [minRating,     setMinRating]     = useState<number | null>(null);
  const [inStockOnly,   setInStockOnly]   = useState(false);
  const [selOffers,     setSelOffers]     = useState<Set<string>>(new Set());
  const [deliveryFilter,setDeliveryFilter]= useState("");
  const [compareList,   setCompareList]   = useState<Set<string>>(new Set());

  const { data: allProducts } = useProducts({ q: initialQuery });
  const results: Result[] = allProducts.map(p => {
    const bestStore = [...p.stores].sort((a, b) => a.price - b.price)[0];
    return {
      id: p._id, name: p.name, brand: p.brand, category: p.category, image: p.image,
      rating: p.rating, reviews: p.reviews, lowestPrice: p.lowestPrice, originalPrice: p.originalPrice,
      discount: p.discount, aiPick: p.tags.includes("aiPick"),
      bestOffer: bestStore?.offer || bestStore?.cashback || bestStore?.coupon || t("search.bestPrice"),
      delivery: bestStore ? `${bestStore.deliveryLabel} · ${bestStore.deliveryTime}` : t("search.standardDelivery"),
      inStock: p.inStock, storesCount: p.stores.length,
      bestStoreName: bestStore?.name ?? "Amazon",
    };
  });

  const sortRef = useRef<HTMLDivElement>(null);
  const PER_PAGE = 8;
  const navLinks: { key: string; label: string }[] = [
    { key: "home", label: t("nav.home") },
    { key: "categories", label: t("nav.categories") },
    { key: "compare", label: t("nav.compare") },
    { key: "priceHistory", label: t("nav.priceHistory") },
    { key: "aiAdvisor", label: t("nav.aiAdvisor") },
    { key: "deals", label: t("nav.deals") },
    { key: "about", label: t("nav.about") },
  ];
  const runSearch = () => navigate(`/search?q=${encodeURIComponent(query)}`);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggleFilter = (key: string) =>
    setOpenFilters(p => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const toggleSet = (s: Set<string>, v: string, set: (x: Set<string>) => void) => {
    const n = new Set(s); n.has(v) ? n.delete(v) : n.add(v); set(n);
  };

  const clearAll = () => {
    setSelCategories(new Set()); setSelBrands(new Set());
    setPriceRange([5000, 200000]); setMinRating(null);
    setInStockOnly(false); setSelOffers(new Set()); setDeliveryFilter("");
  };

  const filtered = results.filter(p => {
    if (selCategories.size > 0 && !selCategories.has(p.category)) return false;
    if (selBrands.size > 0 && !selBrands.has(p.brand)) return false;
    if (p.lowestPrice < priceRange[0] || p.lowestPrice > priceRange[1]) return false;
    if (minRating !== null && p.rating < minRating) return false;
    if (inStockOnly && !p.inStock) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "price-low")  return a.lowestPrice - b.lowestPrice;
    if (sortBy === "price-high") return b.lowestPrice - a.lowestPrice;
    if (sortBy === "rating")     return b.rating - a.rating;
    if (sortBy === "discount")   return b.discount - a.discount;
    return 0;
  });

  const totalPages  = Math.ceil(filtered.length / PER_PAGE);
  const pageItems   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const activeCount = [selCategories.size, selBrands.size, inStockOnly ? 1 : 0, selOffers.size, deliveryFilter ? 1 : 0, (minRating ? 1 : 0)].reduce((a, b) => a + b, 0);

  const sortLabels: Record<string, string> = {
    relevance: t("search.sortLabels.relevance"), "price-low": t("search.sortLabels.price-low"),
    "price-high": t("search.sortLabels.price-high"), rating: t("search.sortLabels.rating"), discount: t("search.sortLabels.discount"),
  };

  // Sidebar content — reused in both desktop & mobile drawer
  const SidebarContent = () => (
    <div className="bg-white dark:bg-[#131B2E] rounded-2xl border border-[#E5E7EB] dark:border-white/10 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-bold text-[#111827] dark:text-white" style={pp}>{t("search.filters")}</span>
        {activeCount > 0 && (
          <button onClick={clearAll} className="text-xs text-[#F97316] font-medium hover:underline" style={it}>
            {t("search.clearAllCount", { count: activeCount })}
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection title={t("search.category")} open={openFilters.has("category")} onToggle={() => toggleFilter("category")}>
        <div className="space-y-2">
          {FILTER_CATEGORIES.map(c => (
            <label key={c} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => toggleSet(selCategories, c, setSelCategories)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${selCategories.has(c) ? "bg-[#F97316] border-[#F97316]" : "border-[#D1D5DB] dark:border-white/20 group-hover:border-[#F97316]"}`}
              >
                {selCategories.has(c) && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <span className="text-sm text-[#374151] dark:text-gray-300 group-hover:text-[#F97316] transition-colors" style={it}>{t(`categoryLabels.${c}`, c)}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Brand */}
      <FilterSection title={t("search.brand")} open={openFilters.has("brand")} onToggle={() => toggleFilter("brand")}>
        <div className="space-y-2">
          {FILTER_BRANDS.map(b => (
            <label key={b} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => toggleSet(selBrands, b, setSelBrands)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${selBrands.has(b) ? "bg-[#F97316] border-[#F97316]" : "border-[#D1D5DB] dark:border-white/20 group-hover:border-[#F97316]"}`}
              >
                {selBrands.has(b) && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <span className="text-sm text-[#374151] dark:text-gray-300 group-hover:text-[#F97316] transition-colors" style={it}>{b}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title={t("search.priceRange")} open={openFilters.has("price")} onToggle={() => toggleFilter("price")}>
        <PriceSlider min={5000} max={200000} value={priceRange} onChange={setPriceRange} />
      </FilterSection>

      {/* Rating */}
      <FilterSection title={t("search.rating")} open={openFilters.has("rating")} onToggle={() => toggleFilter("rating")}>
        <div className="space-y-2">
          {[4, 3, 2].map(r => (
            <button
              key={r}
              onClick={() => setMinRating(minRating === r ? null : r)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-left ${minRating === r ? "border-[#F97316] bg-orange-50 dark:bg-orange-950/30" : "border-[#E5E7EB] dark:border-white/10 hover:border-orange-200"}`}
            >
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} className={`w-3 h-3 ${i <= r ? "fill-[#F97316] text-[#F97316]" : "fill-gray-200 text-gray-200"}`} />)}
              </div>
              <span className="text-xs text-[#374151] dark:text-gray-300" style={it}>{t("search.starsAndUp", { count: r })}</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title={t("search.availability")} open={openFilters.has("avail")} onToggle={() => toggleFilter("avail")}>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-[#374151] dark:text-gray-300" style={it}>{t("search.inStockOnly")}</span>
          <div
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`w-10 h-5.5 rounded-full relative transition-all cursor-pointer ${inStockOnly ? "bg-[#F97316]" : "bg-[#D1D5DB] dark:bg-white/20"}`}
            style={{ height: "1.375rem" }}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${inStockOnly ? "translate-x-5" : "translate-x-0.5"}`} />
          </div>
        </label>
      </FilterSection>

      {/* Offers */}
      <FilterSection title={t("search.offers")} open={openFilters.has("offers")} onToggle={() => toggleFilter("offers")}>
        <div className="space-y-2">
          {FILTER_OFFERS.map(o => (
            <label key={o} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => toggleSet(selOffers, o, setSelOffers)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${selOffers.has(o) ? "bg-[#F97316] border-[#F97316]" : "border-[#D1D5DB] dark:border-white/20 group-hover:border-[#F97316]"}`}
              >
                {selOffers.has(o) && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <span className="text-sm text-[#374151] dark:text-gray-300" style={it}>{t(`search.offerLabels.${o}`, o)}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Delivery Time */}
      <FilterSection title={t("search.deliveryTime")} open={openFilters.has("delivery")} onToggle={() => toggleFilter("delivery")}>
        <div className="space-y-2">
          {["Same Day", "Next Day", "2–3 Days", "4+ Days"].map(d => (
            <button
              key={d}
              onClick={() => setDeliveryFilter(deliveryFilter === d ? "" : d)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-left ${deliveryFilter === d ? "border-[#F97316] bg-orange-50 dark:bg-orange-950/30 text-[#F97316]" : "border-[#E5E7EB] dark:border-white/10 text-[#374151] dark:text-gray-300 hover:border-orange-200"}`}
            >
              <Truck className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-sm" style={it}>{t(`search.deliveryLabels.${d}`, d)}</span>
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0e1f] transition-colors duration-300" style={it}>

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? "bg-white/80 dark:bg-[#0a0e1f]/80 backdrop-blur-xl border-b border-[#E5E7EB] dark:border-white/10 shadow-sm" : "bg-white dark:bg-[#0a0e1f]"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <button onClick={onNavigateHome} className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="SuggestionsForYou" className="w-8 h-8 rounded-xl object-cover shadow-sm" />
            <span className="font-bold text-[#111827] dark:text-white text-base hidden sm:block" style={pp}>SuggestionsForYou</span>
          </button>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
            {navLinks.map(l => (
              <button key={l.key} onClick={() => navigate(NAV_PATHS[l.key])} className="text-sm font-medium text-[#6B7280] hover:text-[#F97316] dark:text-gray-400 dark:hover:text-[#F97316] transition-colors whitespace-nowrap">
                {l.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <LanguageSwitcher />
            <button onClick={() => navigate("/wishlist")} className="relative p-2 text-[#6B7280] hover:text-[#F97316] dark:text-gray-400 transition-colors">
              <Heart className="w-5 h-5" />
              {wishlisted.size > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#F97316] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {wishlisted.size > 99 ? "99+" : wishlisted.size}
                </span>
              )}
            </button>
            <button onClick={() => navigate("/cart")} className="relative p-2 text-[#6B7280] hover:text-[#F97316] dark:text-gray-400 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#F97316] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
            <button className="p-2 text-[#6B7280] hover:text-[#F97316] dark:text-gray-400 transition-colors"><Bell className="w-5 h-5" /></button>
            <button onClick={() => setDark(!dark)} className="p-2 text-[#6B7280] hover:text-[#F97316] dark:text-gray-400 transition-colors">
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {user ? (
              <>
                <button
                  onClick={() => navigate("/account")}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#374151] dark:text-gray-300 hover:text-[#F97316] dark:hover:text-[#F97316] rounded-xl transition-colors"
                >
                  <UserRound className="w-4 h-4 text-[#F97316]" /> {user.name.split(" ")[0]}
                </button>
                <button onClick={logout} title={t("common.signOut")} className="p-2 text-[#6B7280] hover:text-[#F97316] dark:text-gray-400 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button onClick={onLoginRequired} className="px-4 py-2 text-sm font-medium text-[#374151] dark:text-gray-300 hover:text-[#F97316] transition-colors whitespace-nowrap">{t("common.signIn")}</button>
                <button onClick={onLoginRequired} className="px-5 py-2.5 bg-[#F97316] hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg whitespace-nowrap" style={pp}>{t("common.browseFree")}</button>
              </>
            )}
          </div>

          {/* Mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <button onClick={() => navigate("/wishlist")} className="relative p-2 text-[#6B7280] dark:text-gray-400">
              <Heart className="w-5 h-5" />
              {wishlisted.size > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#F97316] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {wishlisted.size > 99 ? "99+" : wishlisted.size}
                </span>
              )}
            </button>
            <button onClick={() => navigate("/cart")} className="relative p-2 text-[#6B7280] dark:text-gray-400">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#F97316] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setDark(!dark)} className="p-2 text-[#6B7280] dark:text-gray-400">
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <LanguageSwitcher compact />
            <button onClick={() => setMobileMenu(!mobileMenu)} className="p-2 text-[#374151] dark:text-gray-300">
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="lg:hidden border-t border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#0a0e1f] px-4 py-4">
            {navLinks.map(l => (
              <button key={l.key} onClick={() => { navigate(NAV_PATHS[l.key]); setMobileMenu(false); }} className="block w-full text-left py-3 text-sm font-medium text-[#374151] dark:text-gray-300 border-b border-[#E5E7EB] dark:border-white/10 last:border-0">{l.label}</button>
            ))}
            {user ? (
              <>
                <button onClick={() => { navigate("/account"); setMobileMenu(false); }} className="w-full mt-4 py-3 bg-[#F97316] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
                  <UserRound className="w-4 h-4" /> {t("common.myAccount")}
                </button>
                <button onClick={() => { logout(); setMobileMenu(false); }} className="w-full mt-3 py-3 border-2 border-[#E5E7EB] dark:border-white/10 text-[#374151] dark:text-gray-300 text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
                  <LogOut className="w-4 h-4" /> {t("common.signOutWithName", { name: user.name.split(" ")[0] })}
                </button>
              </>
            ) : (
              <button onClick={() => { onLoginRequired(); setMobileMenu(false); }} className="w-full mt-4 py-3 bg-[#F97316] text-white text-sm font-semibold rounded-xl" style={pp}>{t("common.getStartedFree")}</button>
            )}
          </div>
        )}
      </nav>

      {/* ── Search Strip ── */}
      <div className="pt-16 bg-gradient-to-b from-orange-50/60 dark:from-orange-950/10 to-white dark:to-[#0a0e1f] border-b border-[#E5E7EB] dark:border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[#9CA3AF] mb-4" style={it}>
            <button onClick={onNavigateHome} className="flex items-center gap-1 hover:text-[#F97316] transition-colors"><Home className="w-3 h-3" /> {t("search.home")}</button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#374151] dark:text-gray-300 font-medium">{t("search.searchResults")}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#F97316] font-medium">{initialQuery ? `"${initialQuery}"` : t(`categoryLabels.${initialCategory}`, initialCategory)}</span>
          </nav>

          {/* Search bar */}
          <div className="relative">
            <div className={`flex items-center bg-white dark:bg-[#131B2E] border-2 rounded-2xl shadow-lg transition-all duration-200 overflow-visible ${showSuggestions && query.length > 0 ? "border-[#F97316] rounded-b-none" : "border-[#E5E7EB] dark:border-white/10 hover:border-orange-300 focus-within:border-[#F97316]"}`}>
              <div className="pl-5 pr-3 text-[#9CA3AF] flex-shrink-0"><Search className="w-5 h-5" /></div>
              <input
                type="text" value={query}
                onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyDown={e => { if (e.key === "Enter" && query.trim().length > 0) { runSearch(); setShowSuggestions(false); } }}
                placeholder={t("search.searchPlaceholder")}
                className="flex-1 py-4 text-sm text-[#111827] dark:text-white placeholder-[#9CA3AF] bg-transparent outline-none min-w-0"
                style={it}
              />
              {query && (
                <button onClick={() => setQuery("")} className="p-2 text-[#9CA3AF] hover:text-[#374151] transition-colors flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button className="p-2 mr-1 text-[#9CA3AF] hover:text-[#F97316] transition-colors flex-shrink-0 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/30">
                <Mic className="w-4 h-4" />
              </button>
              <button onClick={runSearch} className="m-2 px-5 py-3 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all flex-shrink-0" style={pp}>
                {t("search.searchButton")} <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && query.trim().length > 0 && (() => {
              const s = SUGGESTIONS.filter(x => x.toLowerCase().includes(query.toLowerCase()));
              return s.length > 0 ? (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-[#131B2E] border-2 border-t-0 border-[#F97316] rounded-b-2xl shadow-xl z-30 overflow-hidden">
                  {s.map((item, i) => (
                    <button
                      key={item} onMouseDown={() => { setQuery(item); setShowSuggestions(false); }}
                      className={`w-full flex items-center justify-between px-5 py-3.5 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors text-left ${i < s.length - 1 ? "border-b border-[#F3F4F6] dark:border-white/5" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <Search className="w-3.5 h-3.5 text-[#9CA3AF]" />
                        <span className="text-sm text-[#111827] dark:text-white" style={it}>{item}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    </button>
                  ))}
                </div>
              ) : null;
            })()}
          </div>

          {/* Recent Searches */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-xs text-[#9CA3AF] font-medium" style={it}>{t("search.recent")}</span>
            {RECENT_SEARCHES.map(r => (
              <button
                key={r} onClick={() => setQuery(r)}
                className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-gray-400 hover:text-[#F97316] px-3 py-1.5 border border-[#E5E7EB] dark:border-white/10 hover:border-orange-200 rounded-lg bg-white dark:bg-[#131B2E] transition-all"
                style={it}
              >
                <Search className="w-3 h-3" />{r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Page Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">

          {/* ── Desktop Sidebar ── */}
          <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
            <div className="sticky top-24">
              <SidebarContent />
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">

            {/* Top Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setMobileSidebar(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] dark:border-white/10 rounded-xl text-sm font-medium text-[#374151] dark:text-gray-300 hover:border-orange-300 hover:text-[#F97316] transition-all"
                  style={it}
                >
                  <Filter className="w-4 h-4" /> {t("search.filters")}
                  {activeCount > 0 && <span className="w-5 h-5 bg-[#F97316] text-white text-xs rounded-full flex items-center justify-center">{activeCount}</span>}
                </button>
                <div>
                  <p className="text-sm font-semibold text-[#111827] dark:text-white" style={pp}>
                    {t("search.resultsCount", { count: filtered.length })}
                  </p>
                  <p className="text-xs text-[#9CA3AF]" style={it}>{initialQuery ? t("search.forQuery", { query: initialQuery }) : t("search.inCategory", { category: t(`categoryLabels.${initialCategory}`, initialCategory) })}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Sort dropdown */}
                <div className="relative" ref={sortRef}>
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] dark:border-white/10 rounded-xl text-sm font-medium text-[#374151] dark:text-gray-300 hover:border-orange-300 hover:text-[#F97316] transition-all bg-white dark:bg-[#131B2E]"
                    style={it}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">{sortLabels[sortBy]}</span>
                    <span className="sm:hidden">{t("search.sort")}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                  </button>
                  {sortOpen && (
                    <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl shadow-xl z-20 overflow-hidden">
                      {Object.entries(sortLabels).map(([k, v]) => (
                        <button
                          key={k} onClick={() => { setSortBy(k); setSortOpen(false); }}
                          className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors ${sortBy === k ? "text-[#F97316] font-semibold" : "text-[#374151] dark:text-gray-300"}`}
                          style={it}
                        >
                          {v}
                          {sortBy === k && <Check className="w-4 h-4 text-[#F97316]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* View toggle */}
                <div className="flex items-center border border-[#E5E7EB] dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-[#131B2E]">
                  {(["grid", "list"] as const).map(mode => (
                    <button
                      key={mode} onClick={() => setViewMode(mode)}
                      className={`p-2.5 transition-colors ${viewMode === mode ? "bg-[#F97316] text-white" : "text-[#6B7280] hover:text-[#F97316]"}`}
                    >
                      {mode === "grid" ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {activeCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {[...selCategories].map(c => (
                  <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-lg" style={it}>
                    {t(`categoryLabels.${c}`, c)}
                    <button onClick={() => toggleSet(selCategories, c, setSelCategories)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {[...selBrands].map(b => (
                  <span key={b} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-lg" style={it}>
                    {b}
                    <button onClick={() => toggleSet(selBrands, b, setSelBrands)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {minRating && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-lg" style={it}>
                    {t("search.starsAndUp", { count: minRating })}
                    <button onClick={() => setMinRating(null)}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-lg" style={it}>
                    {t("search.inStockOnly")} <button onClick={() => setInStockOnly(false)}><X className="w-3 h-3" /></button>
                  </span>
                )}
                <button onClick={clearAll} className="text-xs text-[#9CA3AF] hover:text-red-500 transition-colors px-2" style={it}>
                  {t("search.clearAll")}
                </button>
              </div>
            )}

            {/* Compare bar */}
            {compareList.size > 0 && (
              <div className="mb-5 p-4 bg-[#111827] dark:bg-[#131B2E] rounded-2xl flex items-center justify-between gap-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-[#F97316] flex-shrink-0" />
                  <span className="text-sm text-white font-medium" style={pp}>
                    {t("search.productsSelected", { count: compareList.size })}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setCompareList(new Set())} className="text-xs text-gray-400 hover:text-white transition-colors" style={it}>{t("search.clear")}</button>
                  <button className="px-4 py-2 bg-[#F97316] hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-all" style={pp}>
                    {t("search.compareNow")}
                  </button>
                </div>
              </div>
            )}

            {/* Product Grid / List */}
            {pageItems.length > 0 ? (
              <div className={viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                : "flex flex-col gap-4"
              }>
                {pageItems.map((p, i) => (
                  <Reveal key={p.id} delay={Math.min(i, 7) * 50}>
                    {viewMode === "grid" ? (
                      <GridCard product={p}
                        wishlisted={wishlisted.has(p.id)}
                        onToggleWish={() => toggleWish(p.id)}
                        comparing={compareList.has(p.id)}
                        onToggleCompare={() => setCompareList(prev => { const n = new Set(prev); n.has(p.id) ? n.delete(p.id) : n.add(p.id); return n; })}
                        onQuickView={() => setQuickViewItem(p)}
                        onCompare={() => navigate(`/compare/${encodeURIComponent(p.name)}`)}
                        onAddToCart={() => addToCart({ productId: p.id, storeName: p.bestStoreName, priceSnapshot: p.lowestPrice, name: p.name, image: p.image })}
                      />
                    ) : (
                      <ListCard product={p}
                        wishlisted={wishlisted.has(p.id)}
                        onToggleWish={() => toggleWish(p.id)}
                        comparing={compareList.has(p.id)}
                        onToggleCompare={() => setCompareList(prev => { const n = new Set(prev); n.has(p.id) ? n.delete(p.id) : n.add(p.id); return n; })}
                        onQuickView={() => setQuickViewItem(p)}
                        onCompare={() => navigate(`/compare/${encodeURIComponent(p.name)}`)}
                        onAddToCart={() => addToCart({ productId: p.id, storeName: p.bestStoreName, priceSnapshot: p.lowestPrice, name: p.name, image: p.image })}
                      />
                    )}
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-[#F8FAFC] dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-[#9CA3AF]" />
                </div>
                <h3 className="text-lg font-semibold text-[#111827] dark:text-white mb-2" style={pp}>{t("search.noResultsTitle")}</h3>
                <p className="text-sm text-[#6B7280] dark:text-gray-400 mb-6" style={it}>{t("search.noResultsSubtitle")}</p>
                <button onClick={clearAll} className="px-6 py-3 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-all" style={pp}>{t("search.clearFilters")}</button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-[#E5E7EB] dark:border-white/10">
                <button
                  onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] dark:border-white/10 rounded-xl text-sm font-medium text-[#374151] dark:text-gray-300 hover:border-orange-300 hover:text-[#F97316] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={it}
                >
                  <ChevronLeft className="w-4 h-4" /> {t("search.previous")}
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${n === page ? "bg-[#F97316] text-white shadow-sm" : "text-[#374151] dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-[#F97316]"}`}
                      style={pp}
                    >{n}</button>
                  ))}
                </div>

                <button
                  onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === totalPages}
                  className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] dark:border-white/10 rounded-xl text-sm font-medium text-[#374151] dark:text-gray-300 hover:border-orange-300 hover:text-[#F97316] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={it}
                >
                  {t("search.next")} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Related Searches */}
            <div className="mt-12 pt-8 border-t border-[#E5E7EB] dark:border-white/10">
              <h3 className="text-sm font-semibold text-[#374151] dark:text-gray-300 mb-4" style={pp}>{t("search.relatedSearches")}</h3>
              <div className="flex flex-wrap gap-2">
                {RELATED_SEARCHES.map(r => (
                  <button
                    key={r} onClick={() => setQuery(r)}
                    className="text-sm text-[#6B7280] dark:text-gray-400 hover:text-[#F97316] dark:hover:text-[#F97316] hover:bg-orange-50 dark:hover:bg-orange-950/30 px-4 py-2 rounded-xl border border-[#E5E7EB] dark:border-white/10 hover:border-orange-200 dark:hover:border-orange-800 transition-all"
                    style={it}
                  >{r}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Sidebar Drawer ── */}
      {mobileSidebar && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileSidebar(false)} />
          <div className="relative w-80 max-w-[90vw] bg-white dark:bg-[#0a0e1f] h-full overflow-y-auto p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <span className="text-base font-bold text-[#111827] dark:text-white" style={pp}>{t("search.filters")}</span>
              <button onClick={() => setMobileSidebar(false)} className="w-8 h-8 bg-[#F3F4F6] dark:bg-white/10 rounded-xl flex items-center justify-center text-[#6B7280]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <SidebarContent />
            <button
              onClick={() => setMobileSidebar(false)}
              className="w-full mt-5 py-3.5 bg-[#F97316] hover:bg-orange-600 text-white rounded-2xl font-semibold text-sm transition-all"
              style={pp}
            >
              {t("search.showResults", { count: filtered.length })}
            </button>
          </div>
        </div>
      )}

      {/* ── Quick View Modal ── */}
      {quickViewItem && (
        <QuickViewModal
          product={quickViewItem}
          onClose={() => setQuickViewItem(null)}
          onCompare={() => { navigate(`/compare/${encodeURIComponent(quickViewItem.name)}`); setQuickViewItem(null); }}
          onAddToCart={() => addToCart({ productId: quickViewItem.id, storeName: quickViewItem.bestStoreName, priceSnapshot: quickViewItem.lowestPrice, name: quickViewItem.name, image: quickViewItem.image })}
        />
      )}

      <style>{`
        .range-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #F97316;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        .range-thumb::-moz-range-thumb {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #F97316;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
