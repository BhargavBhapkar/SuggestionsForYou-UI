import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, MapPin } from "lucide-react";
import { inter, poppins } from "../lib/fonts";

export default function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const columns = t("footer.columns", { returnObjects: true }) as { title: string; links: string[] }[];
  const bottomLinks = t("footer.bottomLinks", { returnObjects: true }) as string[];
  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          S12 — FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer className="bg-[#0C1320] text-gray-400 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Top grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
            {/* Brand — 2 cols */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-5">
                <img src="/logo.svg" alt="SuggestionsForYou" className="w-8 h-8 rounded-xl object-cover" />
                <span className="font-bold text-white text-base" style={poppins}>SuggestionsForYou</span>
              </div>
              <p className="text-sm leading-relaxed mb-6 max-w-xs" style={inter}>
                {t("footer.tagline")}
              </p>
              {/* Newsletter */}
              <p className="text-xs font-semibold text-white mb-3 uppercase tracking-wide" style={inter}>{t("footer.getDealAlerts")}</p>
              <div className="flex gap-2 mb-5">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t("footer.emailPlaceholder")}
                  className="flex-1 px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:border-[#F97316] transition-colors"
                  style={inter}
                />
                <button className="px-4 py-2.5 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-all flex-shrink-0" style={poppins}>
                  <Mail className="w-4 h-4" />
                </button>
              </div>
              {/* Socials */}
              <div className="flex items-center gap-2">
                {[{l:"X"},{l:"in"},{l:"yt"},{l:"ig"}].map(s => (
                  <a key={s.l} href="#" className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 hover:text-[#F97316] flex items-center justify-center text-xs font-semibold transition-all" style={poppins}>{s.l}</a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {columns.map(col => (
              <div key={col.title}>
                <h4 className="font-semibold text-white mb-4 text-sm" style={poppins}>{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-sm hover:text-[#F97316] transition-colors" style={inter}>{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact row */}
          <div className="flex flex-wrap gap-6 py-6 border-t border-white/10 border-b border-white/10 mb-6">
            <a href="mailto:hello@suggestionsforyou.com" className="flex items-center gap-2 text-sm hover:text-[#F97316] transition-colors" style={inter}>
              <Mail className="w-4 h-4" /> hello@suggestionsforyou.com
            </a>
            <a href="#" className="flex items-center gap-2 text-sm hover:text-[#F97316] transition-colors" style={inter}>
              <MapPin className="w-4 h-4" /> {t("footer.address")}
            </a>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs" style={inter}>
            <p>{t("footer.copyright")}</p>
            <div className="flex items-center gap-4">
              {bottomLinks.map(l => (
                <a key={l} href="#" className="hover:text-[#F97316] transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
