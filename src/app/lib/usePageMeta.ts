import { useEffect } from "react";
import { matchPath, useLocation } from "react-router";
import { useTranslation } from "react-i18next";

const SITE = "SuggestionsForYou";

const ROUTES: { pattern: string; key: string }[] = [
  { pattern: "/", key: "home" },
  { pattern: "/categories", key: "categories" },
  { pattern: "/compare/:productName", key: "compare" },
  { pattern: "/search", key: "search" },
  { pattern: "/price-history", key: "priceHistory" },
  { pattern: "/ai-advisor", key: "aiAdvisor" },
  { pattern: "/deals", key: "deals" },
  { pattern: "/about", key: "about" },
  { pattern: "/contact", key: "contact" },
  { pattern: "/privacy", key: "privacy" },
  { pattern: "/terms", key: "terms" },
  { pattern: "/shipping", key: "shipping" },
  { pattern: "/refunds", key: "refunds" },
  { pattern: "/cart", key: "cart" },
  { pattern: "/wishlist", key: "wishlist" },
  { pattern: "/account", key: "account" },
  { pattern: "/checkout", key: "checkout" },
  { pattern: "/order-confirmation/:orderId", key: "orderConfirmation" },
  { pattern: "/account/orders/:orderId", key: "orderDetail" },
];

function safeDecode(s: string) {
  try { return decodeURIComponent(s); } catch { return s; }
}

function setMeta(selector: string, attr: "name" | "property", name: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function usePageMeta() {
  const { pathname, search } = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    let key = "notFound";
    let vars: Record<string, string> = {};
    for (const r of ROUTES) {
      const m = matchPath({ path: r.pattern, end: true }, pathname);
      if (m) {
        key = r.key;
        vars = { name: safeDecode(m.params.productName ?? "") };
        break;
      }
    }

    if (key === "search") {
      const params = new URLSearchParams(search);
      const q = params.get("q")?.trim();
      const category = params.get("category");
      if (q) { vars = { query: q }; }
      else if (category) { key = "searchCategory"; vars = { category: t(`categoryLabels.${category}`, category) }; }
      else key = "searchAll";
    }

    const title = t(`meta.${key}.title`, vars);
    const description = t(`meta.${key}.description`, vars);
    const full = key === "home" ? title : `${title} | ${SITE}`;

    document.documentElement.lang = i18n.language;
    document.title = full;
    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[property="og:title"]', "property", "og:title", full);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
  }, [pathname, search, t, i18n.language]);
}
