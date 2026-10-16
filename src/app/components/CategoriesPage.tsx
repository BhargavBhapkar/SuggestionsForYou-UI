import { useNavigate, useOutletContext } from "react-router";
import { useTranslation } from "react-i18next";
import { Globe, BarChart2, Bot, Flame, ArrowRight } from "lucide-react";
import { inter, poppins } from "../lib/fonts";
import { DEFAULT_PRODUCT } from "../data/products";
import { useCategories } from "../hooks/useApi";
import { CATEGORY_ICONS } from "../lib/icons";
import PageShell from "./PageShell";
import Reveal from "./Reveal";
import type { AppContext } from "../Layout";

export default function CategoriesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { dark } = useOutletContext<AppContext>();
  const { data: categories } = useCategories();
  const onNavigate = (p: string) => {
    if (p === "compare") navigate(`/compare/${encodeURIComponent(DEFAULT_PRODUCT)}`);
    else navigate(`/${p}`);
  };
  const onNavigateToCategory = (categoryName: string) => {
    navigate(`/search?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <PageShell
      onBack={() => navigate("/")}
      title={t("categoriesPage.title")}
      subtitle=""
      icon={<Globe className="w-9 h-9 text-[#F97316]" />}
    >
      <Reveal>
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold text-[#F97316] uppercase tracking-widest mb-2" style={inter}>{t("categoriesPage.eyebrow")}</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] dark:text-white mb-2" style={poppins}>{t("categoriesPage.title")}</h1>
          <p className="text-[#6B7280] dark:text-gray-400 text-sm max-w-md mx-auto" style={inter}>
            {t("categoriesPage.subtitle")}
          </p>
        </div>
      </Reveal>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, i) => {
            const Icon = CATEGORY_ICONS[cat.iconName];
            return (
              <Reveal key={cat._id} delay={i * 50}>
                <button onClick={() => onNavigateToCategory(cat.name)} className="group relative flex flex-col items-center gap-4 p-7 w-full bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-3xl hover:shadow-xl hover:shadow-orange-100 dark:hover:shadow-orange-950/30 hover:-translate-y-2 hover:border-transparent transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" style={{ background: `radial-gradient(ellipse at 30% 30%, ${cat.color}30 0%, transparent 70%)` }} />
                  <div className="relative w-[4.5rem] h-[4.5rem] rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg" style={{ backgroundColor: dark ? cat.darkBg : cat.bg }}>
                    <Icon className="w-9 h-9" style={{ color: cat.color }} />
                  </div>
                  <div className="relative text-center">
                    <p className="text-sm font-semibold text-[#111827] dark:text-white" style={poppins}>{t(`categoryLabels.${cat.name}`, cat.name)}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5" style={inter}>{t("categoriesPage.productsCount", { count: cat.count })}</p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{ backgroundColor: cat.color }} />
                </button>
              </Reveal>
            );
          })}
      </div>

      {/* Category highlights */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { icon: Flame,    color: "#F97316", page: "deals"        },
          { icon: BarChart2, color: "#3B82F6", page: "compare"      },
          { icon: Bot,      color: "#8B5CF6", page: "ai-advisor"   },
        ].map((c, i) => {
          const highlight = t(`categoriesPage.highlights.${i}`, { returnObjects: true }) as { title: string; desc: string };
          const Icon = c.icon;
          return (
            <Reveal key={c.page} delay={i * 80}>
              <button onClick={() => onNavigate(c.page)} className="group flex items-start gap-4 p-5 w-full bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-800/50 hover:-translate-y-1 transition-all duration-300 text-left">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: `${c.color}15` }}>
                  <Icon className="w-5 h-5" style={{ color: c.color }} />
                </div>
                <div>
                  <p className="font-semibold text-[#111827] dark:text-white text-sm mb-1" style={poppins}>{highlight.title}</p>
                  <p className="text-xs text-[#6B7280] dark:text-gray-400" style={inter}>{highlight.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#F97316] group-hover:translate-x-1 ml-auto mt-1 flex-shrink-0 transition-all" />
              </button>
            </Reveal>
          );
        })}
      </div>
    </PageShell>
  );
}
