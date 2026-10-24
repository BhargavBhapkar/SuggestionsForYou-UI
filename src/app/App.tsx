import { Routes, Route } from "react-router";
import Layout from "./Layout";
import Home from "./pages/Home";
import CategoriesPage from "./components/CategoriesPage";
import PriceComparisonPage from "./components/PriceComparisonPage";
import SearchResultsPage from "./SearchResultsPage";
import PriceHistoryPage from "./pages/PriceHistory";
import AIAdvisorPage from "./pages/AIAdvisor";
import DealsPage from "./pages/Deals";
import AboutPage from "./pages/About";
import CartPage from "./pages/Cart";
import WishlistPage from "./pages/Wishlist";
import AccountPage from "./pages/Account";
import CheckoutPage from "./pages/Checkout";
import OrderConfirmationPage from "./pages/OrderConfirmation";
import OrderDetailPage from "./pages/OrderDetail";
import NotFoundPage from "./pages/NotFound";
import ContactPage from "./pages/Contact";
import { PrivacyPage, TermsPage, ShippingPage, RefundsPage } from "./pages/Legal";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="compare/:productName" element={<PriceComparisonPage />} />
        <Route path="search" element={<SearchResultsPage />} />
        <Route path="price-history" element={<PriceHistoryPage />} />
        <Route path="ai-advisor" element={<AIAdvisorPage />} />
        <Route path="deals" element={<DealsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} />
        <Route path="account/orders/:orderId" element={<OrderDetailPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="shipping" element={<ShippingPage />} />
        <Route path="refunds" element={<RefundsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
