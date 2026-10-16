import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import {
  ChevronRight, Sparkles, Eye, Zap, ShieldCheck, PiggyBank, Mail, MapPin,
  ArrowRight,
} from "lucide-react";
import { inter, poppins } from "../lib/fonts";
import Reveal from "../components/Reveal";

const STATS_VALUES = ["< 15 min", "1,500+", "99.9%", "₹180Cr+"];
const STATS_LABEL_KEYS = ["priceRefresh", "productsIndexed", "uptimeSla", "savingsUnlocked"];
const VALUES_ICONS = [Eye, Zap, ShieldCheck, PiggyBank];

export default function AboutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
          <span className="text-sm text-[#6B7280] dark:text-gray-400 hidden sm:block" style={inter}>{t("nav.about")}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14 relative">
        {/* ── Hero ── */}
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-orange-50 dark:bg-orange-950/40 rounded-2xl flex items-center justify-center mx-auto mb-5 animate-glow-pulse">
              <Sparkles className="w-8 h-8 text-[#F97316]" />
            </div>
            <p className="text-xs font-semibold text-[#F97316] uppercase tracking-widest mb-2" style={inter}>{t("aboutPage.ourMission")}</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] dark:text-white mb-3" style={poppins}>{t("aboutPage.title")}</h1>
            <p className="text-[#6B7280] dark:text-gray-400 text-sm" style={inter}>
              {t("aboutPage.subtitle")}
            </p>
          </div>
        </Reveal>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS_VALUES.map((value, i) => (
            <Reveal key={STATS_LABEL_KEYS[i]} delay={i * 60}>
              <div className="group bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-5 text-center hover:shadow-lg hover:shadow-orange-100 dark:hover:shadow-orange-950/30 hover:-translate-y-1 transition-all duration-300">
                <p className="text-2xl font-bold text-[#F97316] group-hover:scale-110 transition-transform duration-300" style={poppins}>{value}</p>
                <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-1" style={inter}>{t(`home.metrics.${STATS_LABEL_KEYS[i]}`)}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ── Our Story ── */}
        <Reveal>
          <div className="bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-6 sm:p-8 hover:shadow-lg dark:hover:shadow-orange-950/20 transition-shadow duration-300">
            <h2 className="text-xl font-bold text-[#111827] dark:text-white mb-4" style={poppins}>{t("aboutPage.ourStoryTitle")}</h2>
            <div className="space-y-4 text-sm text-[#6B7280] dark:text-gray-400 leading-relaxed" style={inter}>
              <p>{t("aboutPage.storyP1")}</p>
              <p>{t("aboutPage.storyP2")}</p>
              <p>{t("aboutPage.storyP3")}</p>
            </div>
          </div>
        </Reveal>

        {/* ── What We Value ── */}
        <div>
          <Reveal>
            <h2 className="text-xl font-bold text-[#111827] dark:text-white text-center mb-6" style={poppins}>{t("aboutPage.whatWeValueTitle")}</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALUES_ICONS.map((Icon, i) => {
              const v = t(`aboutPage.values.${i}`, { returnObjects: true }) as { title: string; desc: string };
              return (
                <Reveal key={v.title} delay={i * 70}>
                  <div className="group bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-5 hover:shadow-lg hover:shadow-orange-100 dark:hover:shadow-orange-950/30 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/40 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-5 h-5 text-[#F97316]" />
                    </div>
                    <h3 className="font-semibold text-[#111827] dark:text-white text-sm mb-1.5" style={poppins}>{v.title}</h3>
                    <p className="text-xs text-[#6B7280] dark:text-gray-400 leading-relaxed" style={inter}>{v.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* ── Contact + CTA ── */}
        <Reveal>
          <div className="bg-[#111827] dark:bg-[#131B2E] rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-40 animate-glow-pulse" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.25) 0%, transparent 60%)" }} />
            <div className="relative">
              <h2 className="text-xl font-bold text-white mb-2" style={poppins}>{t("aboutPage.getInTouch")}</h2>
              <p className="text-sm text-gray-400 mb-5" style={inter}>{t("aboutPage.contactSubtitle")}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                <a href="mailto:hello@suggestionsforyou.com" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-[#F97316] transition-colors" style={inter}>
                  <Mail className="w-4 h-4" /> hello@suggestionsforyou.com
                </a>
                <span className="hidden sm:inline text-gray-600">·</span>
                <span className="inline-flex items-center gap-2 text-sm text-gray-300" style={inter}>
                  <MapPin className="w-4 h-4" /> {t("footer.address")}
                </span>
              </div>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-900/40"
                style={poppins}
              >
                {t("aboutPage.startSavingToday")} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
