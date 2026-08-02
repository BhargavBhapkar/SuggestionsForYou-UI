import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { inter, poppins } from "../lib/fonts";

export default function PageShell({
  onBack, title, subtitle, icon, children,
}: {
  onBack: () => void;
  title: string;
  subtitle: string;
  icon: ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#F8FAFC] dark:bg-[#0a0e1f] transition-colors duration-300 overflow-hidden" style={inter}>
      <div className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-[#F97316]/0 dark:bg-[#F97316]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-64 -left-24 w-[360px] h-[360px] rounded-full bg-purple-400/0 dark:bg-purple-600/10 blur-3xl" />
      <div className="sticky top-0 z-50 border-b border-[#E5E7EB] dark:border-white/10 bg-white/95 dark:bg-[#0a0e1f]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl text-[#6B7280] hover:text-[#F97316] hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:-translate-x-0.5 transition-all">
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <div className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.svg" alt="SuggestionsForYou" className="w-7 h-7 rounded-lg object-cover shadow-sm" />
            <span className="font-bold text-[#111827] dark:text-white text-sm hidden sm:block" style={poppins}>SuggestionsForYou</span>
          </div>
          <span className="text-[#D1D5DB] dark:text-white/20 hidden sm:block">/</span>
          <span className="text-sm text-[#6B7280] dark:text-gray-400 hidden sm:block" style={inter}>{title}</span>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        {children ?? (
          <div className="text-center py-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-20 h-20 bg-orange-50 dark:bg-orange-950/40 rounded-3xl flex items-center justify-center mx-auto mb-6">
              {icon}
            </div>
            <h1 className="text-3xl font-bold text-[#111827] dark:text-white mb-3" style={poppins}>{title}</h1>
            <p className="text-[#6B7280] dark:text-gray-400 mb-8 max-w-md mx-auto" style={inter}>{subtitle}</p>
            <button onClick={onBack} className="px-6 py-3 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-200" style={poppins}>
              Back to Homepage
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
