import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Mail, MapPin, Loader2 } from "lucide-react";
import { inter, poppins } from "../lib/fonts";
import { api } from "../lib/api";
import { DEFAULT_PRODUCT } from "../data/products";
import { useToast } from "./ToastProvider";

const CONTACT_EMAIL = "hello@suggestionsforyou.com";

// Destination for each link in the translated footer.columns lists, by column then
// position. null = no page exists yet, so the link is not rendered.
const LINK_ROUTES: (string | null)[][] = [
  ["/about", null, null, null, null],
  [`/compare/${encodeURIComponent(DEFAULT_PRODUCT)}`, null, "/price-history", "/ai-advisor", "/deals"],
  [null, null, null, null, null],
  ["/privacy", "/terms", "/privacy#storage", "/terms#prices", null],
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Footer() {
  const { t } = useTranslation();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const columns = (t("footer.columns", { returnObjects: true }) as { title: string; links: string[] }[])
    .map((col, ci) => ({
      title: col.title,
      links: col.links.flatMap((label, li) => (LINK_ROUTES[ci]?.[li] ? [{ label, to: LINK_ROUTES[ci][li] as string }] : [])),
    }))
    .filter((col) => col.links.length > 0);

  const address = t("footer.address");

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      toast.error(t("newsletter.invalid"));
      return;
    }
    setSubmitting(true);
    try {
      await api.subscribeNewsletter(value);
      toast.success(t("newsletter.success"));
      setEmail("");
    } catch (err) {
      toast.error(err instanceof TypeError || !(err instanceof Error) ? t("newsletter.failed") : err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#0C1320] text-gray-400 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="lg:col-span-2">
            <Link to="/" aria-label="SuggestionsForYou" onClick={() => window.scrollTo(0, 0)} className="inline-flex items-center gap-2.5 mb-5 hover:opacity-80 transition-opacity">
              <img src="/logo-80.png" alt="" width={32} height={32} className="w-8 h-8 rounded-xl object-cover" />
              <span className="font-bold text-white text-base" style={poppins}>SuggestionsForYou</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-xs" style={inter}>
              {t("footer.tagline")}
            </p>

            <form onSubmit={subscribe} noValidate className="max-w-sm">
              <label htmlFor="footer-newsletter" className="block text-xs font-semibold text-white mb-3 uppercase tracking-wide" style={inter}>
                {t("footer.getDealAlerts")}
              </label>
              <div className="flex gap-2">
                <input
                  id="footer-newsletter"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("footer.emailPlaceholder")}
                  className="flex-1 min-w-0 px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:border-[#F97316] transition-colors"
                  style={inter}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  aria-label={t("newsletter.button")}
                  title={t("newsletter.button")}
                  className="px-4 py-2.5 bg-[#F97316] hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all flex-shrink-0"
                  style={poppins}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h4 className="font-semibold text-white mb-4 text-sm" style={poppins}>{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} onClick={() => window.scrollTo(0, 0)} className="text-sm hover:text-[#F97316] transition-colors" style={inter}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-3 py-6 border-t border-white/10 border-b border-white/10 mb-6">
          <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2 text-sm hover:text-[#F97316] transition-colors break-all" style={inter}>
            <Mail className="w-4 h-4 flex-shrink-0" /> {CONTACT_EMAIL}
          </a>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm hover:text-[#F97316] transition-colors"
            style={inter}
          >
            <MapPin className="w-4 h-4 flex-shrink-0" /> {address}
          </a>
        </div>

        <p className="text-xs text-center sm:text-left" style={inter}>
          {t("footer.copyright", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
