import { Bot, ArrowRight } from "lucide-react";
import { inter, poppins } from "../lib/fonts";
import type { Product } from "../lib/api";

export default function AIProductCard({
  product,
  onCompare,
}: {
  product: Product;
  onCompare: () => void;
}) {
  const score = product.aiScore ?? 90;
  const scoreColor = score >= 95 ? "text-[#10B981]" : score >= 88 ? "text-[#F97316]" : "text-blue-500";
  const scoreBg = score >= 95 ? "bg-[#10B981]" : score >= 88 ? "bg-[#F97316]" : "bg-blue-500";
  return (
    <div className="group bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-5 hover:shadow-xl hover:shadow-purple-100 dark:hover:shadow-purple-950/30 hover:border-purple-200 dark:hover:border-purple-800/50 hover:-translate-y-1.5 transition-all duration-300">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F8FAFC] dark:bg-white/5 flex-shrink-0">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900 text-purple-600 dark:text-purple-400 text-xs font-semibold rounded-md" style={inter}>
              <Bot className="w-3 h-3" /> AI Pick
            </span>
          </div>
          <p className="text-xs text-[#9CA3AF] mb-0.5" style={inter}>{product.brand} · {product.category}</p>
          <h3 className="font-semibold text-[#111827] dark:text-white text-sm leading-snug" style={poppins}>{product.name}</h3>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-[#6B7280] dark:text-gray-400" style={inter}>AI Recommendation Score</span>
          <span className={`text-sm font-bold ${scoreColor}`} style={poppins}>{score}/100</span>
        </div>
        <div className="h-2 bg-[#F3F4F6] dark:bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${scoreBg}`} style={{ width: `${score}%` }} />
        </div>
      </div>

      <p className="text-xs text-[#6B7280] dark:text-gray-400 leading-relaxed mb-4 p-3 bg-[#F8FAFC] dark:bg-white/5 rounded-xl" style={inter}>
        💡 {product.aiReason ?? "AI-recommended pick based on price and value."}
      </p>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[#9CA3AF]" style={inter}>Starting from</p>
          <p className="text-lg font-bold text-[#111827] dark:text-white" style={poppins}>₹{product.lowestPrice.toLocaleString("en-IN")}</p>
        </div>
        <button onClick={onCompare} className="px-4 py-2.5 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all hover:-translate-y-0.5" style={poppins}>
          Compare <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
