import { inter } from "../lib/fonts";

export default function PHTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-xl p-3 shadow-xl text-xs" style={inter}>
      <p className="font-semibold text-[#111827] dark:text-white mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-[#6B7280] dark:text-gray-400 capitalize">{p.dataKey}:</span>
          <span className="font-semibold text-[#111827] dark:text-white">₹{Number(p.value).toLocaleString("en-IN")}</span>
        </div>
      ))}
    </div>
  );
}
