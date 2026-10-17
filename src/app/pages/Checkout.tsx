import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { useTranslation } from "react-i18next";
import { ShoppingBag, Plus, Truck, ShieldCheck, CreditCard, Banknote } from "lucide-react";
import { inter, poppins } from "../lib/fonts";
import PageShell from "../components/PageShell";
import Reveal from "../components/Reveal";
import AddressForm from "../components/AddressForm";
import { useAddresses } from "../hooks/useApi";
import { api } from "../lib/api";
import { imgFit, imgBox } from "../data/products";
import useOnlinePayment from "../lib/useOnlinePayment";
import type { AppContext } from "../Layout";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { cart, cartSubtotal, user, authLoading, onLoginRequired, refreshCart } = useOutletContext<AppContext>();
  const payForOrder = useOnlinePayment(user);
  const { data: addresses, loading: addressesLoading, refetch: refetchAddresses } = useAddresses();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [onlineAvailable, setOnlineAvailable] = useState(false);
  const [method, setMethod] = useState<"cod" | "razorpay">("cod");

  useEffect(() => {
    api.getPaymentConfig()
      .then((c) => { setOnlineAvailable(c.online); if (c.online) setMethod("razorpay"); })
      .catch(() => setOnlineAvailable(false));
  }, []);

  // A first-time customer has no address, so open the form for them instead of leaving a dead button.
  useEffect(() => {
    if (!addressesLoading && addresses.length === 0) setShowAddForm(true);
  }, [addressesLoading, addresses.length]);

  useEffect(() => {
    if (!selectedId && addresses.length > 0) {
      const def = addresses.find((a) => a.isDefault) ?? addresses[0];
      setSelectedId(def._id);
    }
  }, [addresses, selectedId]);

  if (authLoading) {
    return <PageShell onBack={() => navigate("/cart")} title={t("checkout.title")} subtitle="" icon={<ShoppingBag className="w-9 h-9 text-[#F97316]" />} />;
  }

  if (!user) {
    return (
      <PageShell onBack={() => navigate("/cart")} title={t("checkout.title")} subtitle="" icon={<ShoppingBag className="w-9 h-9 text-[#F97316]" />}>
        <div className="text-center py-24">
          <div className="w-20 h-20 bg-orange-50 dark:bg-orange-950/40 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-9 h-9 text-[#F97316]" />
          </div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-white mb-3" style={poppins}>{t("checkout.signInTitle")}</h1>
          <p className="text-[#6B7280] dark:text-gray-400 mb-8" style={inter}>{t("checkout.signInSubtitle")}</p>
          <button onClick={onLoginRequired} className="px-6 py-3 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-semibold" style={poppins}>{t("common.signIn")}</button>
        </div>
      </PageShell>
    );
  }

  if (cart.length === 0) {
    return (
      <PageShell onBack={() => navigate("/")} title={t("checkout.title")} subtitle={t("checkout.emptyCartSubtitle")} icon={<ShoppingBag className="w-9 h-9 text-[#F97316]" />} />
    );
  }

  const placeOrder = async () => {
    if (!selectedId) { setError(t("checkout.errorSelectAddress")); return; }
    setPlacing(true);
    setError("");
    try {
      const { order, payment } = await api.createOrder(selectedId, method);
      if (method === "cod" || !payment) {
        await refreshCart();
        navigate(`/order-confirmation/${order._id}`);
        return;
      }
      const contact = addresses.find((a) => a._id === selectedId)?.phone;
      const outcome = await payForOrder(order, payment, contact);
      if (outcome === "paid") {
        await refreshCart();
        navigate(`/order-confirmation/${order._id}`);
      } else {
        // The order is saved but unpaid; its page offers "Pay now" to try again.
        navigate(`/account/orders/${order._id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("checkout.errorPlaceOrderFailed"));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <PageShell onBack={() => navigate("/cart")} title={t("checkout.title")} subtitle="" icon={<ShoppingBag className="w-9 h-9 text-[#F97316]" />}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white mb-6" style={poppins}>{t("checkout.title")}</h1>

        {/* Address selection */}
        <Reveal>
          <div className="mb-8">
            <h2 className="font-bold text-[#111827] dark:text-white mb-4" style={poppins}>{t("checkout.shippingAddress")}</h2>
            <div className="space-y-3 mb-3">
              {addresses.map((addr) => (
                <label
                  key={addr._id}
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${selectedId === addr._id ? "border-[#F97316] bg-orange-50/50 dark:bg-orange-950/20" : "border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#131B2E]"}`}
                >
                  <input type="radio" name="address" checked={selectedId === addr._id} onChange={() => setSelectedId(addr._id)} className="mt-1 accent-[#F97316]" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-[#111827] dark:text-white text-sm" style={poppins}>{addr.label}</p>
                      {addr.isDefault && <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-950/40 text-[#F97316] text-[10px] font-bold rounded-md">{t("checkout.defaultBadge")}</span>}
                    </div>
                    <p className="text-sm text-[#6B7280] dark:text-gray-400" style={inter}>
                      {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} {addr.pincode}
                    </p>
                    <p className="text-xs text-[#9CA3AF] mt-1" style={inter}>{addr.phone}</p>
                  </div>
                </label>
              ))}
            </div>
            {showAddForm ? (
              <AddressForm
                initial={null}
                onCancel={() => setShowAddForm(false)}
                onSaved={() => { setShowAddForm(false); refetchAddresses(); }}
              />
            ) : (
              <button onClick={() => setShowAddForm(true)} className="flex items-center gap-1.5 text-sm font-semibold text-[#F97316] hover:text-orange-600" style={inter}>
                <Plus className="w-4 h-4" /> {t("checkout.addNewAddress")}
              </button>
            )}
          </div>
        </Reveal>

        {/* Payment method */}
        <Reveal delay={30}>
          <div className="mb-8">
            <h2 className="font-bold text-[#111827] dark:text-white mb-4" style={poppins}>{t("checkout.paymentMethod")}</h2>
            <div className="space-y-3" role="radiogroup" aria-label={t("checkout.paymentMethod")}>
              {onlineAvailable && (
                <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${method === "razorpay" ? "border-[#F97316] bg-orange-50/50 dark:bg-orange-950/20" : "border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#131B2E]"}`}>
                  <input type="radio" name="payment" checked={method === "razorpay"} onChange={() => setMethod("razorpay")} className="mt-1 accent-[#F97316]" />
                  <CreditCard className="w-5 h-5 text-[#F97316] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-[#111827] dark:text-white text-sm" style={poppins}>{t("checkout.payOnline")}</p>
                    <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-0.5" style={inter}>{t("checkout.payOnlineDesc")}</p>
                  </div>
                </label>
              )}
              <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${method === "cod" ? "border-[#F97316] bg-orange-50/50 dark:bg-orange-950/20" : "border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#131B2E]"}`}>
                <input type="radio" name="payment" checked={method === "cod"} onChange={() => setMethod("cod")} className="mt-1 accent-[#F97316]" />
                <Banknote className="w-5 h-5 text-[#F97316] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[#111827] dark:text-white text-sm" style={poppins}>{t("checkout.payCod")}</p>
                  <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-0.5" style={inter}>{t("checkout.payCodDesc")}</p>
                </div>
              </label>
            </div>
          </div>
        </Reveal>

        {/* Order summary */}
        <Reveal delay={60}>
          <div className="bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-5 mb-6">
            <h2 className="font-bold text-[#111827] dark:text-white mb-4" style={poppins}>{t("checkout.orderSummary")}</h2>
            <div className="space-y-3 mb-4">
              {cart.map((line) => (
                <div key={`${line.productId}-${line.storeName}`} className="flex items-center gap-3">
                  <img src={line.image} alt={line.name} className={`w-12 h-12 rounded-lg ${imgFit(line.image, "p-1")} flex-shrink-0 ${imgBox(line.image)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111827] dark:text-white truncate" style={inter}>{line.name}</p>
                    <p className="text-xs text-[#9CA3AF]" style={inter}>{line.storeName} · {t("checkout.qtyLabel", { count: line.qty })}</p>
                  </div>
                  <p className="text-sm font-semibold text-[#111827] dark:text-white flex-shrink-0" style={poppins}>₹{(line.priceSnapshot * line.qty).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-[#F3F4F6] dark:border-white/10 pt-3 space-y-2">
              <div className="flex justify-between text-sm text-[#6B7280] dark:text-gray-400" style={inter}>
                <span>{t("cart.subtotalLabel")}</span><span>₹{cartSubtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm text-[#6B7280] dark:text-gray-400" style={inter}>
                <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-emerald-500" /> {t("checkout.shippingLabel")}</span><span className="text-emerald-500 font-medium">{t("checkout.freeLabel")}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#111827] dark:text-white pt-2 border-t border-[#F3F4F6] dark:border-white/10" style={poppins}>
                <span>{t("checkout.totalLabel")}</span><span>₹{cartSubtotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </Reveal>

        {error && <p className="text-sm text-red-500 mb-4" style={inter}>{error}</p>}
        {!selectedId && !placing && (
          <p role="status" className="text-sm text-amber-600 dark:text-amber-400 text-center mb-3" style={inter}>{t("checkout.addAddressFirst")}</p>
        )}

        <button
          onClick={placeOrder}
          disabled={placing || !selectedId}
          className="w-full py-3.5 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-200 disabled:opacity-60 disabled:hover:translate-y-0"
          style={poppins}
        >
          {placing ? (method === "razorpay" ? t("checkout.processingPayment") : t("checkout.placingOrder")) : method === "razorpay" ? t("checkout.payNowButton", { amount: cartSubtotal.toLocaleString("en-IN") }) : t("checkout.placeOrderCod")}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-xs text-[#9CA3AF] mt-3" style={inter}>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> {method === "razorpay" ? t("checkout.securedByRazorpay") : t("checkout.payInCashNote")}
        </p>
      </div>
    </PageShell>
  );
}
