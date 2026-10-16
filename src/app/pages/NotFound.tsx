import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Compass } from "lucide-react";
import { inter, poppins } from "../lib/fonts";
import PageShell from "../components/PageShell";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <PageShell onBack={() => navigate("/")} title={t("notFound.heading")} subtitle="" icon={<Compass className="w-9 h-9 text-[#F97316]" />}>
      <div className="text-center py-16 sm:py-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <p className="text-7xl sm:text-8xl font-extrabold text-[#F97316] mb-4 leading-none" style={poppins} aria-hidden="true">404</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white mb-3" style={poppins}>{t("notFound.heading")}</h1>
        <p className="text-[#6B7280] dark:text-gray-400 mb-8 max-w-md mx-auto" style={inter}>{t("notFound.body")}</p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-xs sm:max-w-none mx-auto">
          <Link to="/" className="px-6 py-3 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-200" style={poppins}>
            {t("notFound.home")}
          </Link>
          <Link to="/search" className="px-6 py-3 border border-[#E5E7EB] dark:border-white/10 text-[#374151] dark:text-gray-200 hover:border-[#F97316] hover:text-[#F97316] rounded-xl text-sm font-semibold transition-all" style={poppins}>
            {t("notFound.search")}
          </Link>
          <Link to="/categories" className="px-6 py-3 border border-[#E5E7EB] dark:border-white/10 text-[#374151] dark:text-gray-200 hover:border-[#F97316] hover:text-[#F97316] rounded-xl text-sm font-semibold transition-all" style={poppins}>
            {t("notFound.categories")}
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
