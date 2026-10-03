import { useState, useEffect, useCallback, useRef } from "react";
import { Outlet } from "react-router";
import LoginModal from "./components/LoginModal";
import InstallPrompt from "./components/InstallPrompt";
import ChatWidget from "./components/ChatWidget";
import { api, getToken, setToken, type AuthUser } from "./lib/api";

function getSystemTheme(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

const GUEST_CART_KEY = "sfy_guest_cart";
const GUEST_WISHLIST_KEY = "sfy_guest_wishlist";

export interface CartLine {
  productId: string;
  storeName: string;
  qty: number;
  priceSnapshot: number;
  name: string;
  image: string;
}

function readGuestCart(): CartLine[] {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function writeGuestCart(lines: CartLine[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(lines));
}
function readGuestWishlist(): string[] {
  try {
    return JSON.parse(localStorage.getItem(GUEST_WISHLIST_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function writeGuestWishlist(ids: string[]) {
  localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(ids));
}

export type AppContext = {
  dark: boolean;
  setDark: (v: boolean) => void;
  wishlisted: Set<string>;
  toggleWish: (id: string) => void;
  cart: CartLine[];
  cartCount: number;
  cartSubtotal: number;
  addToCart: (line: Omit<CartLine, "qty"> & { qty?: number }) => void;
  updateCartQty: (productId: string, storeName: string, qty: number) => void;
  removeFromCart: (productId: string, storeName: string) => void;
  onLoginRequired: () => void;
  user: AuthUser | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

export default function Layout() {
  const [dark, setDarkState] = useState(getSystemTheme);
  const manualThemeOverride = useRef(false);
  const [wishlisted, setWishlisted] = useState<Set<string>>(new Set(readGuestWishlist()));
  const [cart, setCart] = useState<CartLine[]>(readGuestCart());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const setDark = useCallback((v: boolean) => {
    manualThemeOverride.current = true;
    setDarkState(v);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      if (!manualThemeOverride.current) setDarkState(e.matches);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    if (!getToken()) {
      setAuthLoading(false);
      return;
    }
    api.me()
      .then((res) => {
        setUser(res.user);
        return refreshCartFromServer().then(() => refreshWishlistFromServer());
      })
      .catch(() => setToken(null))
      .finally(() => setAuthLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshCartFromServer = useCallback(async () => {
    const res = await api.getCart();
    setCart(
      res.items.map((it) => ({
        productId: it.product._id,
        storeName: it.storeName,
        qty: it.qty,
        priceSnapshot: it.priceSnapshot,
        name: it.product.name,
        image: it.product.image,
      })),
    );
  }, []);

  const refreshWishlistFromServer = useCallback(async () => {
    const products = await api.getWishlist();
    setWishlisted(new Set(products.map((p) => p._id)));
  }, []);

  const mergeGuestDataIntoServer = useCallback(async () => {
    const guestCart = readGuestCart();
    for (const line of guestCart) {
      await api.addToCart({ productId: line.productId, storeName: line.storeName, qty: line.qty }).catch(() => {});
    }
    writeGuestCart([]);

    const guestWishlist = readGuestWishlist();
    for (const id of guestWishlist) {
      await api.addToWishlist(id).catch(() => {});
    }
    writeGuestWishlist([]);

    await refreshCartFromServer();
    await refreshWishlistFromServer();
  }, [refreshCartFromServer, refreshWishlistFromServer]);

  const toggleWish = (id: string) => {
    if (user) {
      const has = wishlisted.has(id);
      setWishlisted((prev) => {
        const n = new Set(prev);
        has ? n.delete(id) : n.add(id);
        return n;
      });
      (has ? api.removeFromWishlist(id) : api.addToWishlist(id)).catch(() => {
        setWishlisted((prev) => {
          const n = new Set(prev);
          has ? n.add(id) : n.delete(id);
          return n;
        });
      });
      return;
    }
    setWishlisted((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      writeGuestWishlist([...n]);
      return n;
    });
  };

  const addToCart = (line: Omit<CartLine, "qty"> & { qty?: number }) => {
    const qty = line.qty ?? 1;
    if (user) {
      api.addToCart({ productId: line.productId, storeName: line.storeName, qty }).then((res) => {
        setCart(
          res.items.map((it) => ({
            productId: it.product._id,
            storeName: it.storeName,
            qty: it.qty,
            priceSnapshot: it.priceSnapshot,
            name: it.product.name,
            image: it.product.image,
          })),
        );
      });
      return;
    }
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === line.productId && l.storeName === line.storeName);
      const next = existing
        ? prev.map((l) => (l === existing ? { ...l, qty: Math.min(20, l.qty + qty) } : l))
        : [...prev, { ...line, qty }];
      writeGuestCart(next);
      return next;
    });
  };

  const updateCartQty = (productId: string, storeName: string, qty: number) => {
    if (user) {
      api.updateCartItem(productId, { storeName, qty }).then((res) => {
        setCart(
          res.items.map((it) => ({
            productId: it.product._id,
            storeName: it.storeName,
            qty: it.qty,
            priceSnapshot: it.priceSnapshot,
            name: it.product.name,
            image: it.product.image,
          })),
        );
      });
      return;
    }
    setCart((prev) => {
      const next = prev.map((l) => (l.productId === productId && l.storeName === storeName ? { ...l, qty } : l));
      writeGuestCart(next);
      return next;
    });
  };

  const removeFromCart = (productId: string, storeName: string) => {
    if (user) {
      api.removeCartItem(productId, storeName).then((res) => {
        setCart(
          res.items.map((it) => ({
            productId: it.product._id,
            storeName: it.storeName,
            qty: it.qty,
            priceSnapshot: it.priceSnapshot,
            name: it.product.name,
            image: it.product.image,
          })),
        );
      });
      return;
    }
    setCart((prev) => {
      const next = prev.filter((l) => !(l.productId === productId && l.storeName === storeName));
      writeGuestCart(next);
      return next;
    });
  };

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setToken(res.token);
    setUser(res.user);
    await mergeGuestDataIntoServer();
  }, [mergeGuestDataIntoServer]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.signup({ name, email, password });
    setToken(res.token);
    setUser(res.user);
    await mergeGuestDataIntoServer();
  }, [mergeGuestDataIntoServer]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setCart(readGuestCart());
    setWishlisted(new Set(readGuestWishlist()));
  }, []);

  const cartCount = cart.reduce((sum, l) => sum + l.qty, 0);
  const cartSubtotal = cart.reduce((sum, l) => sum + l.qty * l.priceSnapshot, 0);

  const context: AppContext = {
    dark,
    setDark,
    wishlisted,
    toggleWish,
    cart,
    cartCount,
    cartSubtotal,
    addToCart,
    updateCartQty,
    removeFromCart,
    onLoginRequired: () => setShowLoginModal(true),
    user,
    authLoading,
    login,
    signup,
    logout,
  };

  return (
    <>
      <Outlet context={context} />
      <InstallPrompt />
      <ChatWidget />
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          login={login}
          signup={signup}
        />
      )}
    </>
  );
}
