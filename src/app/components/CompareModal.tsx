import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { X, Check, Star, ShoppingCart, ExternalLink, Trophy } from "lucide-react";
import type { Product, StoreOffer } from "../lib/api";
import { inter, poppins } from "../lib/fonts";
import { imgFit, imgBox } from "../data/products";

const HIDDEN_SPECS = new Set(["price as of"]);
const HIGHER_BETTER = /^(spec score|battery|ram|storage|refresh rate|fast charging|charging|speaker output|ssd|bluetooth)\b/i;

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function bestStoreOf(p: Product): StoreOffer | undefined {
  const pool = p.stores.some((s) => s.inStock) ? p.stores.filter((s) => s.inStock) : p.stores;
  return [...pool].sort((a, b) => a.price - b.price)[0];
}

const specValue = (p: Product, label: string) => p.specs.find((s) => s.label === label)?.value;
const specScore = (p: Product) => {
  const n = parseFloat(specValue(p, "Spec score") ?? "");
  return Number.isFinite(n) ? n : null;
};

function parseNum(v: string): { n: number; unit: string } | null {
  const m = v.replace(/,/g, "").match(/(\d+(?:\.\d+)?)\s*([a-zA-Z%/"]*)/);
  return m ? { n: parseFloat(m[1]), unit: m[2].toLowerCase() } : null;
}

// Indexes holding the min/max; empty when fewer than two values or all tie.
function extremes(values: (number | null)[], mode: "min" | "max"): number[] {
  const nums = values.filter((v): v is number => v != null);
  if (nums.length < 2) return [];
  const target = mode === "min" ? Math.min(...nums) : Math.max(...nums);
  if (nums.every((n) => n === target)) return [];
  return values.flatMap((v, i) => (v === target ? [i] : []));
}

// "Best" cell(s) for a spec row, only where higher is clearly better and units match.
function bestSpecCells(label: string, values: (string | undefined)[]): number[] {
  const lower = values.map((v) => v?.trim().toLowerCase());
  const present = lower.filter((v): v is string => !!v);
  if (present.length >= 2 && present.every((v) => v === "yes" || v === "no")) {
    return present.some((v) => v === "no") && present.some((v) => v === "yes")
      ? lower.flatMap((v, i) => (v === "yes" ? [i] : []))
      : [];
  }
  if (label.includes("/") || !HIGHER_BETTER.test(label)) return [];
  const parsed = values.map((v) => (v ? parseNum(v) : null));
  const found = parsed.filter((p): p is { n: number; unit: string } => !!p);
  if (found.length < 2 || !found.every((p) => p.unit === found[0].unit)) return [];
  return extremes(parsed.map((p) => p?.n ?? null), "max");
}

function Row({
  label, cells, cols, best = [], differs = false, bestTag = true,
}: {
  label: string; cells: ReactNode[]; cols: string; best?: number[]; differs?: boolean; bestTag?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="grid border-t border-[#E5E7EB] dark:border-white/10" style={{ gridTemplateColumns: cols }}>
      <div className="sticky left-0 z-10 px-4 py-3 text-xs font-semibold text-[#6B7280] dark:text-gray-400 bg-white dark:bg-[#131B2E]" style={inter}>
        {label}
      </div>
      {cells.map((c, i) => (
        <div
          key={i}
          className={`px-4 py-3 text-sm text-[#111827] dark:text-gray-100 break-words ${best.includes(i) ? "bg-emerald-50 dark:bg-emerald-500/10" : differs ? "bg-amber-50 dark:bg-amber-400/5" : ""}`}
          style={inter}
        >
          {c}
          {bestTag && best.includes(i) && (
            <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 align-middle">
              <Check className="w-3 h-3" /> {t("search.cmp.best")}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function Section({ title }: { title: string }) {
  return (
    <div className="border-t border-[#E5E7EB] dark:border-white/10 bg-[#F8FAFC] dark:bg-white/5">
      <div className="sticky left-0 w-fit px-4 py-2.5 text-sm font-bold text-[#111827] dark:text-white" style={poppins}>{title}</div>
    </div>
  );
}

const Muted = ({ children }: { children: ReactNode }) => <span className="text-[#9CA3AF]">{children}</span>;

export default function CompareModal({
  products, onClose, onRemove, onViewPrices, onAddToCart,
}: {
  products: Product[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onViewPrices: (p: Product) => void;
  onAddToCart: (p: Product) => void;
}) {
  const { t } = useTranslation();
  const [diffOnly, setDiffOnly] = useState(false);
  const [added, setAdded] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCloseRef.current(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => { if (products.length < 2) onCloseRef.current(); }, [products.length]);

  const n = products.length;
  const cols = `minmax(120px,150px) repeat(${n}, minmax(170px, 1fr))`;
  const minWidth = 150 + n * 170;
  const category = (c: string) => t(`categoryLabels.${c}`, c);

  const m = useMemo(() => {
    const bests = products.map(bestStoreOf);
    const cheapest = extremes(products.map((p) => p.lowestPrice), "min");
    const topRated = extremes(products.map((p) => (p.reviews > 0 ? p.rating : null)), "max");
    const bestDiscount = extremes(products.map((p) => p.discount), "max").filter((i) => products[i].discount > 0);
    const topSpecs = extremes(products.map(specScore), "max");

    const labels: string[] = [];
    for (const p of products) for (const s of p.specs) {
      if (!HIDDEN_SPECS.has(s.label.toLowerCase()) && !labels.includes(s.label)) labels.push(s.label);
    }
    const specRows = labels.map((label) => {
      const values = products.map((p) => specValue(p, label));
      const norm = values.map((v) => v?.trim().toLowerCase() ?? "");
      return { label, values, differs: !norm.every((v) => v === norm[0]), best: bestSpecCells(label, values) };
    });

    const storeNames: string[] = [];
    for (const p of products) for (const s of p.stores) if (!storeNames.includes(s.name)) storeNames.push(s.name);

    return { bests, cheapest, topRated, bestDiscount, topSpecs, specRows, storeNames };
  }, [products]);

  const shownSpecs = diffOnly ? m.specRows.filter((r) => r.differs) : m.specRows;
  const hiddenCount = m.specRows.length - shownSpecs.length;

  const takes: string[] = [];
  if (m.cheapest.length === 1) {
    const i = m.cheapest[0];
    const priciest = products.reduce((a, b) => (b.lowestPrice > a.lowestPrice ? b : a));
    takes.push(t("search.cmp.tCheapest", { name: products[i].name, price: products[i].lowestPrice.toLocaleString("en-IN"), diff: (priciest.lowestPrice - products[i].lowestPrice).toLocaleString("en-IN"), other: priciest.name }));
  }
  if (m.bestDiscount.length === 1) takes.push(t("search.cmp.tDiscount", { name: products[m.bestDiscount[0]].name, percent: products[m.bestDiscount[0]].discount }));
  if (m.topSpecs.length === 1) takes.push(t("search.cmp.tSpec", { name: products[m.topSpecs[0]].name, score: specScore(products[m.topSpecs[0]]) }));
  if (m.topRated.length === 1) takes.push(t("search.cmp.tRated", { name: products[m.topRated[0]].name, rating: products[m.topRated[0]].rating.toFixed(1), reviews: products[m.topRated[0]].reviews.toLocaleString("en-IN") }));
  else if (products.every((p) => p.reviews === 0)) takes.push(t("search.cmp.tNoRatings"));
  const oos = products.filter((p) => !p.inStock);
  if (oos.length) takes.push(t("search.cmp.tStock", { names: oos.map((p) => p.name).join(", ") }));
  if (m.specRows.length === 0) takes.push(t("search.cmp.tNoSpecs"));

  const chips = (i: number) => {
    const out: string[] = [];
    if (m.cheapest.includes(i)) out.push(t("search.cmp.lowestPrice"));
    if (m.topRated.includes(i)) out.push(t("search.cmp.topRated"));
    if (m.bestDiscount.includes(i)) out.push(t("search.cmp.bestDiscount"));
    if (m.topSpecs.includes(i)) out.push(t("search.cmp.topSpecs"));
    return out;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-stretch sm:items-center justify-center sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        role="dialog" aria-modal="true" aria-label={t("search.cmp.title")}
        className="relative w-full max-w-6xl max-h-full flex flex-col bg-white dark:bg-[#131B2E] sm:rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-[#E5E7EB] dark:border-white/10 flex-shrink-0">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-[#111827] dark:text-white" style={poppins}>{t("search.cmp.title")}</h2>
            <p className="text-xs text-[#6B7280] dark:text-gray-400" style={inter}>{t("search.cmp.subtitle", { count: n })}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {m.specRows.length > 0 && (
              <button
                onClick={() => setDiffOnly((v) => !v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${diffOnly ? "bg-[#F97316] border-[#F97316] text-white" : "border-[#E5E7EB] dark:border-white/10 text-[#374151] dark:text-gray-300 hover:border-[#F97316]"}`}
                style={inter} aria-pressed={diffOnly}
              >
                {diffOnly ? t("search.cmp.allDetails") : t("search.cmp.differencesOnly")}
              </button>
            )}
            <button ref={closeRef} onClick={onClose} aria-label={t("search.cmp.close")} className="w-8 h-8 rounded-xl bg-[#F3F4F6] dark:bg-white/10 flex items-center justify-center text-[#6B7280] hover:text-[#111827] dark:hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-auto flex-1">
          <div style={{ minWidth }}>
            {takes.length > 0 && (
              <div className="px-4 sm:px-6 py-4 bg-orange-50 dark:bg-orange-500/5 border-b border-[#E5E7EB] dark:border-white/10">
                <p className="sticky left-4 sm:left-6 text-xs font-bold text-[#F97316] mb-1.5 flex items-center gap-1.5" style={poppins}>
                  <Trophy className="w-3.5 h-3.5" /> {t("search.cmp.quickTake")}
                </p>
                <ul className="space-y-1">
                  {takes.map((line, i) => (
                    <li key={i} className="sticky left-4 sm:left-6 text-sm text-[#374151] dark:text-gray-300 max-w-[min(48rem,calc(100vw-2rem))]" style={inter}>{line}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="sticky top-0 z-20 grid bg-white dark:bg-[#131B2E] border-b border-[#E5E7EB] dark:border-white/10" style={{ gridTemplateColumns: cols }}>
              <div className="sticky left-0 z-10 bg-white dark:bg-[#131B2E]" />
              {products.map((p, i) => {
                const best = m.bests[i];
                return (
                  <div key={p._id} className="relative p-4 flex flex-col items-center text-center gap-2">
                    <button onClick={() => onRemove(p._id)} aria-label={`${t("search.cmp.remove")} ${p.name}`} title={t("search.cmp.remove")} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#F3F4F6] dark:bg-white/10 flex items-center justify-center text-[#6B7280] hover:text-red-500 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className={`w-24 h-24 rounded-xl overflow-hidden ${imgBox(p.image)} border border-[#E5E7EB] dark:border-white/10`}>
                      <img src={p.image} alt={p.name} className={`w-full h-full ${imgFit(p.image, "p-1.5")}`} />
                    </div>
                    <p className="text-sm font-semibold text-[#111827] dark:text-white line-clamp-2 min-h-[2.5rem]" style={poppins}>{p.name}</p>
                    <div>
                      <p className="text-lg font-bold text-[#111827] dark:text-white" style={poppins}>{inr(p.lowestPrice)}</p>
                      {m.cheapest.includes(i) && (
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold" style={inter}>{t("search.cmp.cheapest")}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button onClick={() => onViewPrices(p)} className="px-3 py-1.5 rounded-lg bg-[#F97316] hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-1 whitespace-nowrap transition-colors" style={inter}>
                        <ExternalLink className="w-3 h-3" /> {t("search.cmp.viewPrices")}
                      </button>
                      <button
                        onClick={() => { onAddToCart(p); setAdded(p._id); setTimeout(() => setAdded((cur) => (cur === p._id ? null : cur)), 1500); }}
                        disabled={!p.inStock || !best}
                        title={t("search.cmp.addToCart")} aria-label={t("search.cmp.addToCart")}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${added === p._id ? "bg-emerald-500 border-emerald-500 text-white" : "border-[#E5E7EB] dark:border-white/10 text-[#6B7280] hover:border-[#F97316] hover:text-[#F97316]"}`}
                      >
                        {added === p._id ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {products.some((_, i) => chips(i).length > 0) && (
              <Row
                label={t("search.cmp.glance")} cols={cols}
                cells={products.map((_, i) => chips(i).length
                  ? <div className="flex flex-wrap gap-1">{chips(i).map((c) => <span key={c} className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">{c}</span>)}</div>
                  : <Muted>—</Muted>)}
              />
            )}

            <Section title={t("search.cmp.sections.overview")} />
            <Row label={t("search.cmp.rows.brand")} cols={cols} cells={products.map((p) => p.brand)} differs={new Set(products.map((p) => p.brand)).size > 1} />
            <Row label={t("search.cmp.rows.category")} cols={cols} cells={products.map((p) => category(p.category))} />
            <Row
              label={t("search.cmp.rows.availability")} cols={cols}
              differs={new Set(products.map((p) => p.inStock)).size > 1}
              cells={products.map((p) => p.inStock
                ? <span className="text-emerald-600 dark:text-emerald-400 font-medium">{t("search.cmp.inStock")}</span>
                : <span className="text-red-500 font-medium">{t("search.cmp.outOfStock")}</span>)}
            />
            <Row
              label={t("search.cmp.rows.rating")} cols={cols} best={m.topRated}
              cells={products.map((p) => p.reviews > 0
                ? <span className="inline-flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{p.rating.toFixed(1)} <span className="text-xs text-[#9CA3AF]">({t("search.cmp.reviewsCount", { count: p.reviews })})</span></span>
                : <Muted>{t("search.cmp.noReviews")}</Muted>)}
            />

            <Section title={t("search.cmp.sections.price")} />
            <Row label={t("search.cmp.rows.bestPrice")} cols={cols} best={m.cheapest} cells={products.map((p) => <span className="font-bold">{inr(p.lowestPrice)}</span>)} />
            <Row label={t("search.cmp.rows.mrp")} cols={cols} cells={products.map((p) => (p.originalPrice > p.lowestPrice ? <span className="line-through text-[#9CA3AF]">{inr(p.originalPrice)}</span> : <Muted>—</Muted>))} />
            <Row label={t("search.cmp.rows.discount")} cols={cols} best={m.bestDiscount} cells={products.map((p) => (p.discount > 0 ? `${p.discount}%` : <Muted>—</Muted>))} />
            <Row label={t("search.cmp.rows.bestStore")} cols={cols} cells={products.map((_, i) => m.bests[i]?.name ?? <Muted>{t("search.cmp.notAvailable")}</Muted>)} />
            <Row
              label={t("search.cmp.rows.spread")} cols={cols}
              cells={products.map((p) => {
                if (!p.stores.length) return <Muted>—</Muted>;
                const prices = p.stores.map((s) => s.price);
                const lo = Math.min(...prices), hi = Math.max(...prices);
                return lo === hi ? inr(lo) : `${inr(lo)} – ${inr(hi)}`;
              })}
            />

            {m.storeNames.length > 0 && <Section title={t("search.cmp.sections.stores")} />}
            {m.storeNames.map((store) => {
              const offers = products.map((p) => p.stores.find((s) => s.name === store));
              return (
                <Row
                  key={store} label={store} cols={cols} bestTag={false}
                  best={extremes(offers.map((o) => (o && o.inStock ? o.price : null)), "min")}
                  cells={offers.map((o) => o
                    ? <div><span className={o.inStock ? "font-semibold" : "text-[#9CA3AF] line-through"}>{inr(o.price)}</span>
                        <p className="text-[11px] text-[#9CA3AF]">{o.inStock ? `${o.deliveryLabel} · ${o.deliveryTime}` : t("search.cmp.outOfStock")}</p></div>
                    : <Muted>{t("search.cmp.notAvailable")}</Muted>)}
                />
              );
            })}

            {m.specRows.length > 0 && <Section title={t("search.cmp.sections.specs")} />}
            {shownSpecs.map((r) => (
              <Row
                key={r.label} label={r.label} cols={cols} best={r.best} differs={r.differs}
                cells={r.values.map((v) => v ?? <Muted>{t("search.cmp.notAvailable")}</Muted>)}
              />
            ))}
            {diffOnly && m.specRows.length > 0 && shownSpecs.length === 0 && (
              <p className="sticky left-0 max-w-[calc(100vw-2rem)] px-4 py-4 text-sm text-[#6B7280] dark:text-gray-400 border-t border-[#E5E7EB] dark:border-white/10" style={inter}>{t("search.cmp.identical")}</p>
            )}
            {diffOnly && hiddenCount > 0 && shownSpecs.length > 0 && (
              <p className="sticky left-0 max-w-[calc(100vw-2rem)] px-4 py-3 text-xs text-[#9CA3AF] border-t border-[#E5E7EB] dark:border-white/10" style={inter}>{t("search.cmp.hiddenIdentical", { count: hiddenCount })}</p>
            )}

            <Section title={t("search.cmp.sections.before")} />
            <Row
              label={t("search.cmp.rows.delivery")} cols={cols}
              cells={products.map((_, i) => { const b = m.bests[i]; return b ? `${b.deliveryLabel} · ${b.deliveryTime}` : <Muted>—</Muted>; })}
            />
            <Row
              label={t("search.cmp.rows.offers")} cols={cols}
              cells={products.map((_, i) => {
                const b = m.bests[i];
                const list = b ? [b.offer, b.cashback, b.coupon && `Coupon ${b.coupon}`].filter(Boolean) as string[] : [];
                return list.length ? <ul className="space-y-0.5">{list.map((o) => <li key={o}>{o}</li>)}</ul> : <Muted>{t("search.cmp.noOffers")}</Muted>;
              })}
            />
            <Row
              label={t("search.cmp.rows.storesInStock")} cols={cols}
              cells={products.map((p) => t("search.cmp.ofStores", { inStock: p.stores.filter((s) => s.inStock).length, total: p.stores.length }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
