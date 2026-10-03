import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { useTranslation } from "react-i18next";
import { UserRound, MapPin, Package, Plus, Pencil, Trash2, LogOut, Check } from "lucide-react";
import { inter, poppins } from "../lib/fonts";
import PageShell from "../components/PageShell";
import Reveal from "../components/Reveal";
import AddressForm from "../components/AddressForm";
import { useAddresses, useOrders } from "../hooks/useApi";
import { api } from "../lib/api";
import type { AppContext } from "../Layout";

const STATUS_STYLES: Record<string, string> = {
  placed: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900",
  confirmed: "bg-orange-50 dark:bg-orange-950/40 text-[#F97316] border-orange-100 dark:border-orange-900",
  shipped: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900",
  delivered: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900",
  cancelled: "bg-red-50 dark:bg-red-950/40 text-red-500 border-red-100 dark:border-red-900",
};

export default function AccountPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, authLoading, logout, onLoginRequired } = useOutletContext<AppContext>();
  const { data: addresses, refetch: refetchAddresses } = useAddresses();
  const { data: orders } = useOrders();
  const [formMode, setFormMode] = useState<"none" | "add" | string>("none");

  if (authLoading) {
    return <PageShell onBack={() => navigate("/")} title={t("account.title")} subtitle="" icon={<UserRound className="w-9 h-9 text-[#F97316]" />} />;
  }

  if (!user) {
    return (
      <PageShell onBack={() => navigate("/")} title={t("account.title")} subtitle="" icon={<UserRound className="w-9 h-9 text-[#F97316]" />}>
        <div className="text-center py-24">
          <div className="w-20 h-20 bg-orange-50 dark:bg-orange-950/40 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <UserRound className="w-9 h-9 text-[#F97316]" />
          </div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-white mb-3" style={poppins}>{t("account.signInTitle")}</h1>
          <p className="text-[#6B7280] dark:text-gray-400 mb-8" style={inter}>{t("account.signInSubtitle")}</p>
          <button onClick={onLoginRequired} className="px-6 py-3 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-semibold" style={poppins}>{t("common.signIn")}</button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell onBack={() => navigate("/")} title={t("account.title")} subtitle="" icon={<UserRound className="w-9 h-9 text-[#F97316]" />}>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Profile */}
        <Reveal>
          <div className="bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-50 dark:bg-orange-950/40 rounded-2xl flex items-center justify-center flex-shrink-0">
                <UserRound className="w-7 h-7 text-[#F97316]" />
              </div>
              <div>
                <p className="font-semibold text-[#111827] dark:text-white" style={poppins}>{user.name}</p>
                <p className="text-sm text-[#9CA3AF]" style={inter}>{user.email}</p>
              </div>
            </div>
            <button onClick={logout} className="p-2.5 text-[#6B7280] hover:text-red-500 dark:text-gray-400 border border-[#E5E7EB] dark:border-white/10 rounded-xl transition-colors" title={t("common.signOut")}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </Reveal>

        {/* Addresses */}
        <Reveal delay={60}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#111827] dark:text-white flex items-center gap-2" style={poppins}>
                <MapPin className="w-4 h-4 text-[#F97316]" /> {t("account.addressesHeading")}
              </h2>
              {formMode === "none" && (
                <button onClick={() => setFormMode("add")} className="flex items-center gap-1.5 text-sm font-semibold text-[#F97316] hover:text-orange-600" style={inter}>
                  <Plus className="w-4 h-4" /> {t("account.addNew")}
                </button>
              )}
            </div>

            {formMode === "add" && (
              <AddressForm initial={null} onCancel={() => setFormMode("none")} onSaved={() => { setFormMode("none"); refetchAddresses(); }} />
            )}

            <div className="space-y-3">
              {addresses.map((addr) => (
                formMode === addr._id ? (
                  <AddressForm key={addr._id} initial={addr} onCancel={() => setFormMode("none")} onSaved={() => { setFormMode("none"); refetchAddresses(); }} />
                ) : (
                  <div key={addr._id} className="bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-4 flex items-start justify-between gap-3">
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
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!addr.isDefault && (
                        <button onClick={async () => { await api.updateAddress(addr._id, { isDefault: true }); refetchAddresses(); }} title={t("account.setAsDefault")} className="p-2 text-[#9CA3AF] hover:text-emerald-500 transition-colors">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => setFormMode(addr._id)} title={t("common.edit")} className="p-2 text-[#9CA3AF] hover:text-[#F97316] transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={async () => { await api.deleteAddress(addr._id); refetchAddresses(); }} title={t("common.delete")} className="p-2 text-[#9CA3AF] hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              ))}
              {addresses.length === 0 && formMode === "none" && (
                <p className="text-sm text-[#9CA3AF] text-center py-6" style={inter}>{t("account.noAddresses")}</p>
              )}
            </div>
          </div>
        </Reveal>

        {/* Order history */}
        <Reveal delay={120}>
          <div>
            <h2 className="font-bold text-[#111827] dark:text-white flex items-center gap-2 mb-4" style={poppins}>
              <Package className="w-4 h-4 text-[#F97316]" /> {t("account.orderHistoryHeading")}
            </h2>
            <div className="space-y-3">
              {orders.map((order) => (
                <button
                  key={order._id}
                  onClick={() => navigate(`/account/orders/${order._id}`)}
                  className="w-full text-left bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-orange-200 dark:hover:border-orange-800/50 hover:-translate-y-0.5 transition-all"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#111827] dark:text-white" style={poppins}>
                      {t("account.orderItemsCount", { count: order.items.length })} · ₹{order.total.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5" style={inter}>
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border flex-shrink-0 ${STATUS_STYLES[order.orderStatus]}`}>
                    {t(`orderStatus.${order.orderStatus}`, order.orderStatus)}
                  </span>
                </button>
              ))}
              {orders.length === 0 && (
                <p className="text-sm text-[#9CA3AF] text-center py-6" style={inter}>{t("account.noOrders")}</p>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </PageShell>
  );
}
