import { useNavigate, useOutletContext } from "react-router";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { inter, poppins } from "../lib/fonts";
import PageShell from "../components/PageShell";
import Reveal from "../components/Reveal";
import { useWishlist } from "../hooks/useApi";
import type { AppContext } from "../Layout";

export default function WishlistPage() {
  const navigate = useNavigate();
  const { user, authLoading, wishlisted, toggleWish, addToCart, onLoginRequired } = useOutletContext<AppContext>();
  const { data: products, loading } = useWishlist();

  if (authLoading) {
    return <PageShell onBack={() => navigate("/")} title="Wishlist" subtitle="" icon={<Heart className="w-9 h-9 text-[#F97316]" />} />;
  }

  if (!user) {
    return (
      <PageShell onBack={() => navigate("/")} title="Wishlist" subtitle="" icon={<Heart className="w-9 h-9 text-[#F97316]" />}>
        <div className="text-center py-24">
          <div className="w-20 h-20 bg-orange-50 dark:bg-orange-950/40 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Heart className="w-9 h-9 text-[#F97316]" />
          </div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-white mb-3" style={poppins}>Sign in to view your wishlist</h1>
          <p className="text-[#6B7280] dark:text-gray-400 mb-8" style={inter}>Items you favorite are saved here once you're signed in.</p>
          <button onClick={onLoginRequired} className="px-6 py-3 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-semibold" style={poppins}>Sign In</button>
        </div>
      </PageShell>
    );
  }

  const items = products.filter((p) => wishlisted.has(p._id));

  if (!loading && items.length === 0) {
    return (
      <PageShell
        onBack={() => navigate("/")}
        title="Wishlist"
        subtitle="Tap the heart icon on any product to save it here for later."
        icon={<Heart className="w-9 h-9 text-[#F97316]" />}
      />
    );
  }

  return (
    <PageShell onBack={() => navigate("/")} title="Wishlist" subtitle="" icon={<Heart className="w-9 h-9 text-[#F97316]" />}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white mb-6" style={poppins}>
          Your Wishlist ({items.length})
        </h1>
        <div className="space-y-3">
          {items.map((product) => {
            const bestStore = product.stores.find((s) => s.price === product.lowestPrice) ?? product.stores[0];
            return (
              <Reveal key={product._id}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-4">
                  <button
                    onClick={() => navigate(`/compare/${encodeURIComponent(product.name)}`)}
                    className="flex items-center gap-4 flex-1 min-w-0 text-left"
                  >
                    <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-[#F8FAFC] dark:bg-white/5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#111827] dark:text-white truncate" style={poppins}>{product.name}</p>
                      <p className="text-xs text-[#9CA3AF] mt-0.5" style={inter}>{product.brand} · {product.category}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-0.5 text-xs text-[#6B7280] dark:text-gray-400" style={inter}>
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {product.rating}
                        </span>
                        <span className="text-sm font-bold text-[#F97316]" style={poppins}>₹{product.lowestPrice.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
                    <button
                      onClick={() => bestStore && addToCart({ productId: product._id, storeName: bestStore.name, priceSnapshot: bestStore.price, name: product.name, image: product.image })}
                      disabled={!product.inStock}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#F97316] hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold transition-colors"
                      style={poppins}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> {product.inStock ? "Add to Cart" : "Out of Stock"}
                    </button>
                    <button onClick={() => toggleWish(product._id)} title="Remove from wishlist" className="p-2 text-red-500 hover:text-red-600 transition-colors flex-shrink-0">
                      <Heart className="w-4 h-4 fill-red-500" />
                    </button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
