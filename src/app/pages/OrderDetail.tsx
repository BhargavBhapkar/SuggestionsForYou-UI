import { useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router";
import { useTranslation } from "react-i18next";
import { Package, Check, Truck, Home, XCircle, MapPin, CreditCard } from "lucide-react";
import { inter, poppins } from "../lib/fonts";
import PageShell from "../components/PageShell";
import Reveal from "../components/Reveal";
import { useOrder } from "../hooks/useApi";
import { api } from "../lib/api";
import { imgFit, imgBox } from "../data/products";
import { useToast } from "../components/ToastProvider";
import useOnlinePayment from "../lib/useOnlinePayment";
import type { AppContext } from "../Layout";

const SUPPORT_EMAIL = "support@suggestionsforyou.com";
const PAYMENT_BADGE: Record<string, string> = {
  paid: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
  pending: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
  failed: "bg-red-50 dark:bg-red-950/40 text-red-500",
};

const STEPS = [
  { key: "placed", icon: Package },
  { key: "confirmed", icon: Check },
  { key: "shipped", icon: Truck },
  { key: "delivered", icon: Home },
] as const;

export default function OrderDetailPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToast();
  const { orderId } = useParams<{ orderId: string }>();
  const { user, refreshCart } = useOutletContext<AppContext>();
  const payForOrder = useOnlinePayment(user);
  const [paying, setPaying] = useState(false);
  const { data: order, loading, refetch } = useOrder(orderId);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  if (loading) {
    return (
      <PageShell onBack={() => navigate("/account")} title={t("orderDetail.title")} subtitle="" icon={<Package className="w-9 h-9 text-[#F97316]" />}>
        <p className="text-center text-sm text-[#9CA3AF] py-24" style={inter}>{t("common.loading")}</p>
      </PageShell>
    );
  }

  if (!order) {
    return (
      <PageShell onBack={() => navigate("/account")} title={t("orderDetail.title")} subtitle={t("orderDetail.notFound")} icon={<Package className="w-9 h-9 text-[#F97316]" />} />
    );
  }

  const stepIndex = STEPS.findIndex((s) => s.key === order.orderStatus);
  const isOnline = order.paymentMethod === "razorpay";
  const paidOnline = isOnline && order.paymentStatus === "paid";
  const needsPayment = isOnline && order.paymentStatus !== "paid" && order.orderStatus !== "cancelled";
  const canCancel = (order.orderStatus === "placed" || order.orderStatus === "confirmed") && !paidOnline;

  const payNow = async () => {
    setPaying(true);
    setError("");
    try {
      const { payment } = await api.startPayment(order._id);
      const outcome = await payForOrder(order, payment, order.shippingAddress.phone);
      if (outcome === "paid") await refreshCart();
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("toast.paymentFailed"));
    } finally {
      setPaying(false);
    }
  };

  const cancelOrder = async () => {
    setCancelling(true);
    setError("");
    try {
      await api.cancelOrder(order._id);
      toast.success(t("toast.orderCancelled"));
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("orderDetail.errorCancelFailed"));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <PageShell onBack={() => navigate("/account")} title={t("orderDetail.title")} subtitle="" icon={<Package className="w-9 h-9 text-[#F97316]" />}>
      <div className="max-w-2xl mx-auto">
        <Reveal>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-[#111827] dark:text-white" style={poppins}>{t("orderDetail.orderNumber", { id: order._id.slice(-8).toUpperCase() })}</h1>
              <p className="text-sm text-[#9CA3AF]" style={inter}>
                {t("orderDetail.placedOn", { date: new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) })}
              </p>
            </div>
            <p className="text-xl font-bold text-[#F97316]" style={poppins}>₹{order.total.toLocaleString("en-IN")}</p>
          </div>
        </Reveal>

        {/* Status */}
        <Reveal delay={40}>
          <div className="bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-5 mb-5">
            {order.orderStatus === "cancelled" ? (
              <div className="flex items-center gap-3 text-red-500">
                <XCircle className="w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="font-semibold" style={poppins}>{t("orderDetail.orderCancelledTitle")}</p>
                  <p className="text-xs text-[#9CA3AF]" style={inter}>{t("orderDetail.orderCancelledSubtitle")}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                {STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const done = i <= stepIndex;
                  return (
                    <div key={step.key} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${done ? "bg-[#F97316] text-white" : "bg-[#F3F4F6] dark:bg-white/10 text-[#9CA3AF]"}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-medium ${done ? "text-[#F97316]" : "text-[#9CA3AF]"}`} style={inter}>{t(`orderStatus.${step.key}`)}</span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`h-0.5 flex-1 mx-2 mb-4 transition-colors ${i < stepIndex ? "bg-[#F97316]" : "bg-[#F3F4F6] dark:bg-white/10"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Reveal>

        {/* Items */}
        <Reveal delay={80}>
          <div className="bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-5 mb-5">
            <h2 className="font-bold text-[#111827] dark:text-white mb-4 text-sm" style={poppins}>{t("orderDetail.itemsHeading")}</h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className={`w-12 h-12 rounded-lg ${imgFit(item.image, "p-1")} flex-shrink-0 ${imgBox(item.image)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111827] dark:text-white truncate" style={inter}>{item.name}</p>
                    <p className="text-xs text-[#9CA3AF]" style={inter}>{item.storeName} · {t("checkout.qtyLabel", { count: item.qty })}</p>
                  </div>
                  <p className="text-sm font-semibold text-[#111827] dark:text-white flex-shrink-0" style={poppins}>₹{(item.price * item.qty).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Shipping address */}
        <Reveal delay={120}>
          <div className="bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-5 mb-5">
            <h2 className="font-bold text-[#111827] dark:text-white mb-3 text-sm flex items-center gap-1.5" style={poppins}>
              <MapPin className="w-3.5 h-3.5 text-[#F97316]" /> {t("orderDetail.shippingAddressHeading")}
            </h2>
            <p className="text-sm text-[#374151] dark:text-gray-300" style={inter}>
              {order.shippingAddress.label} — {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
            </p>
            <p className="text-xs text-[#9CA3AF] mt-1" style={inter}>{order.shippingAddress.phone}</p>
          </div>
        </Reveal>

        {/* Payment */}
        <Reveal delay={160}>
          <div className="bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-5 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#9CA3AF] uppercase tracking-wide" style={inter}>{t("orderDetail.paymentMethodLabel")}</p>
                <p className="text-sm font-medium text-[#111827] dark:text-white" style={inter}>{isOnline ? t("orderDetail.onlinePayment") : t("orderDetail.cashOnDelivery")}</p>
              </div>
              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg ${PAYMENT_BADGE[order.paymentStatus] ?? PAYMENT_BADGE.pending}`}>{t(`paymentStatus.${order.paymentStatus}`, order.paymentStatus)}</span>
            </div>
            {needsPayment && (
              <div className="mt-4 pt-4 border-t border-[#F3F4F6] dark:border-white/10">
                <p className="text-sm text-[#6B7280] dark:text-gray-400 mb-3" style={inter}>{t("orderDetail.paymentPendingNote")}</p>
                <button
                  onClick={payNow}
                  disabled={paying}
                  className="w-full py-3 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  style={poppins}
                >
                  <CreditCard className="w-4 h-4" /> {paying ? t("orderDetail.openingPayment") : t("orderDetail.payNow", { amount: order.total.toLocaleString("en-IN") })}
                </button>
              </div>
            )}
          </div>
        </Reveal>

        {error && <p className="text-sm text-red-500 mb-4" style={inter}>{error}</p>}

        {paidOnline && order.orderStatus !== "cancelled" && (
          <p className="text-xs text-[#9CA3AF] text-center mb-4" style={inter}>{t("orderDetail.refundNote", { email: SUPPORT_EMAIL })}</p>
        )}

        {canCancel && (
          <button
            onClick={cancelOrder}
            disabled={cancelling}
            className="w-full py-3 border-2 border-red-200 dark:border-red-900 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 transition-all disabled:opacity-60"
            style={poppins}
          >
            {cancelling ? t("orderDetail.cancelling") : t("orderDetail.cancelOrder")}
          </button>
        )}
      </div>
    </PageShell>
  );
}
