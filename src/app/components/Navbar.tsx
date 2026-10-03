import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Bell, Moon, Sun, Menu, X, UserRound, LogOut, ShoppingCart, Heart } from "lucide-react";
import { inter, poppins } from "../lib/fonts";
import type { AuthUser } from "../lib/api";
import LanguageSwitcher from "./LanguageSwitcher";

const DEFAULT_PRODUCT = "Samsung Galaxy S25 Ultra";

const NAV_PATHS: Record<string, string> = {
  home: "/", categories: "/categories", compare: `/compare/${encodeURIComponent(DEFAULT_PRODUCT)}`,
  priceHistory: "/price-history", aiAdvisor: "/ai-advisor",
  deals: "/deals", about: "/about",
};

export default function Navbar({
  dark, setDark, onLoginRequired, user, onLogout, cartCount = 0, wishlistCount = 0,
}: {
  dark: boolean;
  setDark: (v: boolean) => void;
  onLoginRequired: () => void;
  user: AuthUser | null;
  onLogout: () => void;
  cartCount?: number;
  wishlistCount?: number;
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks: { key: string; label: string }[] = [
    { key: "home", label: t("nav.home") },
    { key: "categories", label: t("nav.categories") },
    { key: "compare", label: t("nav.compare") },
    { key: "priceHistory", label: t("nav.priceHistory") },
    { key: "aiAdvisor", label: t("nav.aiAdvisor") },
    { key: "deals", label: t("nav.deals") },
    { key: "about", label: t("nav.about") },
  ];

  return (
    <>
      {/* ── Navbar ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-[#0a0e1f]/80 backdrop-blur-xl border-b border-[#E5E7EB] dark:border-white/10 shadow-sm"
            : "bg-white dark:bg-[#0a0e1f]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); navigate("/"); window.scrollTo(0, 0); }}
            className="flex items-center gap-2.5 flex-shrink-0"
          >
            <img src="/logo.svg" alt="SuggestionsForYou" className="w-8 h-8 rounded-xl object-cover shadow-sm" />
            <span
              className="font-bold text-[#111827] dark:text-white text-base hidden sm:block"
              style={poppins}
            >
              SuggestionsForYou
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
            {navLinks.map((l) => (
              <button
                key={l.key}
                onClick={() => {
                  navigate(NAV_PATHS[l.key]); window.scrollTo(0, 0);
                }}
                className="text-sm font-medium text-[#6B7280] hover:text-[#F97316] dark:text-gray-400 dark:hover:text-[#F97316] transition-colors duration-150 relative whitespace-nowrap after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-0.5 after:bg-[#F97316] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <button onClick={() => navigate("/wishlist")} className="relative p-2 text-[#6B7280] hover:text-[#F97316] dark:text-gray-400 transition-colors">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#F97316] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
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
            <button className="p-2 text-[#6B7280] hover:text-[#F97316] dark:text-gray-400 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDark(!dark)}
              className="p-2 text-[#6B7280] hover:text-[#F97316] dark:text-gray-400 transition-colors"
            >
              {dark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <LanguageSwitcher />
            {user ? (
              <>
                <button
                  onClick={() => navigate("/account")}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#374151] dark:text-gray-300 hover:text-[#F97316] dark:hover:text-[#F97316] rounded-xl transition-colors"
                >
                  <UserRound className="w-4 h-4 text-[#F97316]" /> {user.name.split(" ")[0]}
                </button>
                <button onClick={onLogout} title={t("common.signOut")} className="p-2 text-[#6B7280] hover:text-[#F97316] dark:text-gray-400 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button onClick={onLoginRequired} className="px-4 py-2 text-sm font-medium text-[#374151] dark:text-gray-300 hover:text-[#F97316] dark:hover:text-[#F97316] border border-transparent hover:border-[#F97316]/30 rounded-xl transition-all duration-200 whitespace-nowrap">
                  {t("common.signIn")}
                </button>
                <button onClick={onLoginRequired} className="px-5 py-2.5 bg-[#F97316] hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-200 dark:hover:shadow-orange-900 active:translate-y-0 active:shadow-none whitespace-nowrap">
                  {t("common.browseFree")}
                </button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <button onClick={() => navigate("/wishlist")} className="relative p-2 text-[#6B7280] dark:text-gray-400">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#F97316] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
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
            <button
              onClick={() => setDark(!dark)}
              className="p-2 text-[#6B7280] dark:text-gray-400"
            >
              {dark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <LanguageSwitcher compact />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-[#374151] dark:text-gray-300"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#0a0e1f] px-4 py-4">
            {navLinks.map((l) => {
              return (
                <a
                  key={l.key}
                  href="#"
                  onClick={(e) => { e.preventDefault(); navigate(NAV_PATHS[l.key]); setMobileOpen(false); window.scrollTo(0, 0); }}
                  className="block py-3 text-sm font-medium text-[#374151] dark:text-gray-300 border-b border-[#E5E7EB] dark:border-white/10 last:border-0"
                >
                  {l.label}
                </a>
              );
            })}
            {user ? (
              <>
                <button
                  onClick={() => { navigate("/account"); setMobileOpen(false); }}
                  className="w-full mt-4 py-3 bg-[#F97316] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
                >
                  <UserRound className="w-4 h-4" /> {t("common.myAccount")}
                </button>
                <button
                  onClick={() => { onLogout(); setMobileOpen(false); }}
                  className="w-full mt-3 py-3 border-2 border-[#E5E7EB] dark:border-white/10 text-[#374151] dark:text-gray-300 text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> {t("common.signOutWithName", { name: user.name.split(" ")[0] })}
                </button>
              </>
            ) : (
              <button
                onClick={() => { onLoginRequired(); setMobileOpen(false); }}
                className="w-full mt-4 py-3 bg-[#F97316] text-white text-sm font-semibold rounded-xl"
              >
                {t("common.getStartedFree")}
              </button>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
