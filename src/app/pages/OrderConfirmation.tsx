import { useParams, useNavigate } from "react-router";
import { CheckCircle2, Package, ArrowRight, Home } from "lucide-react";
import { inter, poppins } from "../lib/fonts";
import PageShell from "../components/PageShell";
import Reveal from "../components/Reveal";
import { useOrder } from "../hooks/useApi";

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, loading } = useOrder(orderId);

  if (loading) {
    return (
      <PageShell onBack={() => navigate("/")} title="Order Confirmed" subtitle="" icon={<Package className="w-9 h-9 text-[#F97316]" />}>
        <p className="text-center text-sm text-[#9CA3AF] py-24" style={inter}>Loading your order…</p>
      </PageShell>
    );
  }

  if (!order) {
    return (
      <PageShell onBack={() => navigate("/")} title="Order Confirmed" subtitle="We couldn't find that order." icon={<Package className="w-9 h-9 text-[#F97316]" />} />
    );
  }

  return (
    <PageShell onBack={() => navigate("/")} title="Order Confirmed" subtitle="" icon={<CheckCircle2 className="w-9 h-9 text-[#F97316]" />}>
      <div className="max-w-xl mx-auto text-center">
        <Reveal>
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white mb-2" style={poppins}>Order Placed!</h1>
          <p className="text-[#6B7280] dark:text-gray-400 mb-8" style={inter}>
            Thanks for your order — we'll deliver it to your address and you can pay in cash on arrival.
          </p>
        </Reveal>

        <Reveal delay={60}>
          <div className="bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-5 text-left mb-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#F3F4F6] dark:border-white/10">
              <div>
                <p className="text-xs text-[#9CA3AF] uppercase tracking-wide" style={inter}>Order ID</p>
                <p className="text-sm font-semibold text-[#111827] dark:text-white font-mono" style={poppins}>{order._id.slice(-8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#9CA3AF] uppercase tracking-wide" style={inter}>Total</p>
                <p className="text-lg font-bold text-[#F97316]" style={poppins}>₹{order.total.toLocaleString("en-IN")}</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-[#F8FAFC] dark:bg-white/5" />
                  <p className="text-sm text-[#374151] dark:text-gray-300 flex-1 min-w-0 truncate" style={inter}>{item.name}</p>
                  <p className="text-xs text-[#9CA3AF] flex-shrink-0" style={inter}>Qty {item.qty}</p>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-[#F3F4F6] dark:border-white/10">
              <p className="text-xs text-[#9CA3AF] uppercase tracking-wide mb-1" style={inter}>Delivering to</p>
              <p className="text-sm text-[#374151] dark:text-gray-300" style={inter}>
                {order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate(`/account/orders/${order._id}`)}
              className="flex-1 py-3 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
              style={poppins}
            >
              Track Order <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 py-3 border-2 border-[#E5E7EB] dark:border-white/10 text-[#374151] dark:text-gray-300 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:border-orange-300 hover:text-[#F97316] transition-all"
              style={poppins}
            >
              <Home className="w-4 h-4" /> Continue Shopping
            </button>
          </div>
        </Reveal>
      </div>
    </PageShell>
  );
}
