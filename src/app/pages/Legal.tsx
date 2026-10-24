import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { ShieldCheck, FileText, TriangleAlert, Truck, RotateCcw } from "lucide-react";
import { inter, poppins } from "../lib/fonts";
import PageShell from "../components/PageShell";
import { LEGAL_DRAFT, LEGAL_UPDATED, PRIVACY, TERMS, SHIPPING, REFUNDS, type LegalDoc } from "../data/legal";

function LegalPage({ doc, metaKey, icon }: { doc: LegalDoc; metaKey: "privacy" | "terms" | "shipping" | "refunds"; icon: React.ReactNode }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { hash } = useLocation();
  const title = t(`meta.${metaKey}.title`);

  useEffect(() => {
    if (!hash) return;
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
  }, [hash]);

  return (
    <PageShell onBack={() => navigate("/")} title={title} subtitle="" icon={icon}>
      <article className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 bg-orange-50 dark:bg-orange-950/40 rounded-2xl flex items-center justify-center flex-shrink-0">{icon}</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white" style={poppins}>{title}</h1>
        </div>
        <p className="text-xs text-[#9CA3AF] mb-6" style={inter}>
          {t("legal.lastUpdated", { date: LEGAL_UPDATED })} · {t("legal.englishOnly")}
        </p>

        {LEGAL_DRAFT && (
          <div role="note" className="flex items-start gap-2.5 mb-8 px-4 py-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-sm text-amber-900 dark:text-amber-100" style={inter}>
            <TriangleAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{t("legal.draftBanner")}</span>
          </div>
        )}

        <div lang="en" className="space-y-8" style={inter}>
          <p className="text-[#374151] dark:text-gray-300 leading-relaxed">{doc.intro}</p>
          {doc.sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="text-lg font-semibold text-[#111827] dark:text-white mb-3" style={poppins}>{s.heading}</h2>
              {s.paragraphs?.map((p) => (
                <p key={p} className="text-[#374151] dark:text-gray-300 leading-relaxed mb-3">{p}</p>
              ))}
              {s.bullets && (
                <ul className="list-disc pl-5 space-y-2 text-[#374151] dark:text-gray-300 leading-relaxed mb-3">
                  {s.bullets.map((b) => <li key={b}>{b}</li>)}
                </ul>
              )}
              {s.after?.map((p) => (
                <p key={p} className="text-[#374151] dark:text-gray-300 leading-relaxed mb-3">{p}</p>
              ))}
            </section>
          ))}
        </div>
      </article>
    </PageShell>
  );
}

export function PrivacyPage() {
  return <LegalPage doc={PRIVACY} metaKey="privacy" icon={<ShieldCheck className="w-6 h-6 text-[#F97316]" />} />;
}

export function TermsPage() {
  return <LegalPage doc={TERMS} metaKey="terms" icon={<FileText className="w-6 h-6 text-[#F97316]" />} />;
}

export function ShippingPage() {
  return <LegalPage doc={SHIPPING} metaKey="shipping" icon={<Truck className="w-6 h-6 text-[#F97316]" />} />;
}

export function RefundsPage() {
  return <LegalPage doc={REFUNDS} metaKey="refunds" icon={<RotateCcw className="w-6 h-6 text-[#F97316]" />} />;
}
