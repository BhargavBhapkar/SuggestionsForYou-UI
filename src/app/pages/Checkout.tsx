import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { ShoppingBag, Plus, Truck, ShieldCheck } from "lucide-react";
import { inter, poppins } from "../lib/fonts";
import PageShell from "../components/PageShell";
import Reveal from "../components/Reveal";
import AddressForm from "../components/AddressForm";
import { useAddresses } from "../hooks/useApi";
import { api } from "../lib/api";
import type { AppContext } from "../Layout";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartSubtotal, user, authLoading, onLoginRequired } = useOutletContext<AppContext>();
  const { data: addresses, refetch: refetchAddresses } = useAddresses();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedId && addresses.length > 0) {
      const def = addresses.find((a) => a.isDefault) ?? addresses[0];
      setSelectedId(def._id);
    }
  }, [addresses, selectedId]);

  if (authLoading) {
    return <PageShell onBack={() => navigate("/cart")} title="Checkout" subtitle="" icon={<ShoppingBag className="w-9 h-9 text-[#F97316]" />} />;
  }

  if (!user) {
    return (
      <PageShell onBack={() => navigate("/cart")} title="Checkout" subtitle="" icon={<ShoppingBag className="w-9 h-9 text-[#F97316]" />}>
        <div className="text-center py-24">
          <div className="w-20 h-20 bg-orange-50 dark:bg-orange-950/40 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-9 h-9 text-[#F97316]" />
          </div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-white mb-3" style={poppins}>Sign in to checkout</h1>
          <p className="text-[#6B7280] dark:text-gray-400 mb-8" style={inter}>You'll need an account to place an order.</p>
          <button onClick={onLoginRequired} className="px-6 py-3 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-semibold" style={poppins}>Sign In</button>
        </div>
      </PageShell>
    );
  }

  if (cart.length === 0) {
    return (
      <PageShell onBack={() => navigate("/")} title="Checkout" subtitle="Your cart is empty — add some products first." icon={<ShoppingBag className="w-9 h-9 text-[#F97316]" />} />
    );
  }

  const placeOrder = async () => {
    if (!selectedId) { setError("Please select a shipping address"); return; }
    setPlacing(true);
    setError("");
    try {
      const order = await api.createOrder(selectedId);
      navigate(`/order-confirmation/${order._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <PageShell onBack={() => navigate("/cart")} title="Checkout" subtitle="" icon={<ShoppingBag className="w-9 h-9 text-[#F97316]" />}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white mb-6" style={poppins}>Checkout</h1>

        {/* Address selection */}
        <Reveal>
          <div className="mb-8">
            <h2 className="font-bold text-[#111827] dark:text-white mb-4" style={poppins}>Shipping Address</h2>
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
                      {addr.isDefault && <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-950/40 text-[#F97316] text-[10px] font-bold rounded-md">DEFAULT</span>}
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
                <Plus className="w-4 h-4" /> Add New Address
              </button>
            )}
          </div>
        </Reveal>

        {/* Order summary */}
        <Reveal delay={60}>
          <div className="bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-5 mb-6">
            <h2 className="font-bold text-[#111827] dark:text-white mb-4" style={poppins}>Order Summary</h2>
            <div className="space-y-3 mb-4">
              {cart.map((line) => (
                <div key={`${line.productId}-${line.storeName}`} className="flex items-center gap-3">
                  <img src={line.image} alt={line.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-[#F8FAFC] dark:bg-white/5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111827] dark:text-white truncate" style={inter}>{line.name}</p>
                    <p className="text-xs text-[#9CA3AF]" style={inter}>{line.storeName} · Qty {line.qty}</p>
                  </div>
                  <p className="text-sm font-semibold text-[#111827] dark:text-white flex-shrink-0" style={poppins}>₹{(line.priceSnapshot * line.qty).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-[#F3F4F6] dark:border-white/10 pt-3 space-y-2">
              <div className="flex justify-between text-sm text-[#6B7280] dark:text-gray-400" style={inter}>
                <span>Subtotal</span><span>₹{cartSubtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm text-[#6B7280] dark:text-gray-400" style={inter}>
                <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-emerald-500" /> Shipping</span><span className="text-emerald-500 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#111827] dark:text-white pt-2 border-t border-[#F3F4F6] dark:border-white/10" style={poppins}>
                <span>Total</span><span>₹{cartSubtotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </Reveal>

        {error && <p className="text-sm text-red-500 mb-4" style={inter}>{error}</p>}

        <button
          onClick={placeOrder}
          disabled={placing || !selectedId}
          className="w-full py-3.5 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-200 disabled:opacity-60 disabled:hover:translate-y-0"
          style={poppins}
        >
          {placing ? "Placing Order…" : "Place Order · Cash on Delivery"}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-xs text-[#9CA3AF] mt-3" style={inter}>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Pay in cash when your order arrives
        </p>
      </div>
    </PageShell>
  );
}
