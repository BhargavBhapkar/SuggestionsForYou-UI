import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "../i18n";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) ?? SUPPORTED_LANGUAGES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Language"
        className={`flex items-center gap-1.5 text-[#6B7280] hover:text-[#F97316] dark:text-gray-400 transition-colors ${compact ? "p-2" : "px-2.5 py-2 rounded-xl"}`}
      >
        <Globe className="w-5 h-5" />
        {!compact && <span className="text-xs font-semibold">{current.code.toUpperCase()}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-xl shadow-lg py-1.5 z-50">
          {SUPPORTED_LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { i18n.changeLanguage(l.code); setOpen(false); }}
              className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between hover:bg-[#F8FAFC] dark:hover:bg-white/5 transition-colors ${l.code === i18n.language ? "text-[#F97316] font-semibold" : "text-[#374151] dark:text-gray-300"}`}
            >
              {l.nativeLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
