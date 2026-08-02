import { useNavigate } from "react-router";
import {
  ChevronRight, Sparkles, Eye, Zap, ShieldCheck, PiggyBank, Mail, MapPin,
  ArrowRight,
} from "lucide-react";
import { inter, poppins } from "../lib/fonts";
import Reveal from "../components/Reveal";

const STATS = [
  { value: "< 15 min", label: "Price refresh rate" },
  { value: "2.4M+", label: "Products indexed" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "₹180Cr+", label: "User savings unlocked" },
];

const VALUES = [
  { icon: Eye, title: "Transparency", desc: "Every price shown is the real, live price from the retailer — no hidden markups, no manufactured discounts." },
  { icon: Zap, title: "Speed", desc: "Prices refresh every 15 minutes across 50+ retailers, so you're never acting on stale information." },
  { icon: ShieldCheck, title: "Trust & Security", desc: "Only verified, genuine sellers make the cut. No fake listings, no malicious redirects, ever." },
  { icon: PiggyBank, title: "Real Savings", desc: "We measure success in rupees saved, not clicks earned — our AI recommends waiting when waiting pays off." },
];

export default function AboutPage() {
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
          <div className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.svg" alt="SuggestionsForYou" className="w-7 h-7 rounded-lg object-cover shadow-sm" />
            <span className="font-bold text-[#111827] dark:text-white text-sm hidden sm:block" style={poppins}>SuggestionsForYou</span>
          </div>
          <span className="text-[#D1D5DB] dark:text-white/20 hidden sm:block">/</span>
          <span className="text-sm text-[#6B7280] dark:text-gray-400 hidden sm:block" style={inter}>About</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14 relative">
        {/* ── Hero ── */}
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-orange-50 dark:bg-orange-950/40 rounded-2xl flex items-center justify-center mx-auto mb-5 animate-glow-pulse">
              <Sparkles className="w-8 h-8 text-[#F97316]" />
            </div>
            <p className="text-xs font-semibold text-[#F97316] uppercase tracking-widest mb-2" style={inter}>Our Mission</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] dark:text-white mb-3" style={poppins}>About SuggestionsForYou</h1>
            <p className="text-[#6B7280] dark:text-gray-400 text-sm" style={inter}>
              We're on a mission to make every Indian purchase smarter. Compare prices across 50+ retailers in real time.
            </p>
          </div>
        </Reveal>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 60}>
              <div className="group bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-5 text-center hover:shadow-lg hover:shadow-orange-100 dark:hover:shadow-orange-950/30 hover:-translate-y-1 transition-all duration-300">
                <p className="text-2xl font-bold text-[#F97316] group-hover:scale-110 transition-transform duration-300" style={poppins}>{s.value}</p>
                <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-1" style={inter}>{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ── Our Story ── */}
        <Reveal>
          <div className="bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-6 sm:p-8 hover:shadow-lg dark:hover:shadow-orange-950/20 transition-shadow duration-300">
            <h2 className="text-xl font-bold text-[#111827] dark:text-white mb-4" style={poppins}>Our Story</h2>
            <div className="space-y-4 text-sm text-[#6B7280] dark:text-gray-400 leading-relaxed" style={inter}>
              <p>
                SuggestionsForYou started with a simple frustration: the same product could cost thousands of rupees more or less
                depending on which retailer's app you happened to open first — and there was no easy way to know which one was
                actually the best deal, or whether today's "sale" price was real.
              </p>
              <p>
                So we built a single place that watches 50+ Indian retailers around the clock, tracks every price change, and
                uses that history to tell shoppers not just where to buy, but when. What began as a way to avoid overpaying
                on one laptop has grown into a platform tracking 2.4 million+ products for shoppers across the country.
              </p>
              <p>
                We're not a retailer, and we never take a cut that costs you money — we earn a small commission from retailers
                when you buy, at no extra cost to you. Our only incentive is finding you the genuine best price.
              </p>
            </div>
          </div>
        </Reveal>

        {/* ── What We Value ── */}
        <div>
          <Reveal>
            <h2 className="text-xl font-bold text-[#111827] dark:text-white text-center mb-6" style={poppins}>What We Value</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
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
              <h2 className="text-xl font-bold text-white mb-2" style={poppins}>Get in Touch</h2>
              <p className="text-sm text-gray-400 mb-5" style={inter}>Questions, feedback, or partnership ideas — we'd love to hear from you.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                <a href="mailto:hello@suggestionsforyou.com" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-[#F97316] transition-colors" style={inter}>
                  <Mail className="w-4 h-4" /> hello@suggestionsforyou.com
                </a>
                <span className="hidden sm:inline text-gray-600">·</span>
                <span className="inline-flex items-center gap-2 text-sm text-gray-300" style={inter}>
                  <MapPin className="w-4 h-4" /> Bengaluru, Karnataka, India
                </span>
              </div>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-900/40"
                style={poppins}
              >
                Start Saving Today <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
