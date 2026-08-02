import { useNavigate, useOutletContext } from "react-router";
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { inter, poppins } from "../lib/fonts";
import PageShell from "../components/PageShell";
import Reveal from "../components/Reveal";
import type { AppContext } from "../Layout";

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, cartSubtotal, updateCartQty, removeFromCart, user, onLoginRequired } = useOutletContext<AppContext>();

  return (
    <PageShell
      onBack={() => navigate("/")}
      title="Your Cart"
      subtitle="Add products from the Compare page to see them here."
      icon={<ShoppingCart className="w-9 h-9 text-[#F97316]" />}
    >
      {cart.length === 0 ? null : (
        <Reveal>
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white mb-6" style={poppins}>
              Your Cart ({cart.reduce((s, l) => s + l.qty, 0)} items)
            </h1>

            {!user && (
              <div className="mb-5 px-4 py-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl text-sm text-orange-700 dark:text-orange-300" style={inter}>
                You're browsing as a guest — <button onClick={onLoginRequired} className="font-semibold underline underline-offset-2">sign in</button> to save this cart to your account.
              </div>
            )}

            <div className="space-y-3 mb-6">
              {cart.map((line) => (
                <div key={`${line.productId}-${line.storeName}`} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <img src={line.image} alt={line.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-[#F8FAFC] dark:bg-white/5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#111827] dark:text-white truncate" style={poppins}>{line.name}</p>
                      <p className="text-xs text-[#9CA3AF] mt-0.5" style={inter}>from {line.storeName}</p>
                      <p className="text-sm font-bold text-[#F97316] mt-1" style={poppins}>₹{line.priceSnapshot.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                    <div className="flex items-center gap-2 border border-[#E5E7EB] dark:border-white/10 rounded-xl">
                      <button onClick={() => updateCartQty(line.productId, line.storeName, Math.max(1, line.qty - 1))} className="p-2 text-[#6B7280] hover:text-[#F97316]">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-semibold text-[#111827] dark:text-white w-4 text-center" style={poppins}>{line.qty}</span>
                      <button onClick={() => updateCartQty(line.productId, line.storeName, Math.min(20, line.qty + 1))} className="p-2 text-[#6B7280] hover:text-[#F97316]">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(line.productId, line.storeName)} className="p-2 text-[#9CA3AF] hover:text-red-500 transition-colors flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#9CA3AF] uppercase tracking-wide" style={inter}>Subtotal</p>
                <p className="text-xl font-bold text-[#111827] dark:text-white" style={poppins}>₹{cartSubtotal.toLocaleString("en-IN")}</p>
              </div>
              <button
                onClick={() => (user ? navigate("/checkout") : onLoginRequired())}
                className="px-6 py-3 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-200"
                style={poppins}
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Reveal>
      )}
    </PageShell>
  );
}
