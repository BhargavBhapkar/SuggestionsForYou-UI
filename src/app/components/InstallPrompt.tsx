import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Download, X } from "lucide-react";
import { inter, poppins } from "../lib/fonts";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "sfy_install_dismissed";

export default function InstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone || sessionStorage.getItem(DISMISSED_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !deferredPrompt) return null;

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(DISMISSED_KEY, "1");
  };

  const install = async () => {
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm px-4 py-3.5 bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/40 rounded-xl flex items-center justify-center flex-shrink-0">
        <Download className="w-5 h-5 text-[#F97316]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#111827] dark:text-white" style={poppins}>{t("installPrompt.title")}</p>
        <p className="text-xs text-[#6B7280] dark:text-gray-400" style={inter}>{t("installPrompt.subtitle")}</p>
      </div>
      <button onClick={install} className="px-3.5 py-2 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-xs font-semibold flex-shrink-0 transition-colors" style={poppins}>
        {t("installPrompt.install")}
      </button>
      <button onClick={dismiss} className="p-1 text-[#9CA3AF] hover:text-[#374151] dark:hover:text-gray-300 flex-shrink-0" aria-label={t("installPrompt.dismiss")}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
