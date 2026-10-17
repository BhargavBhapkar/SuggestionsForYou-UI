import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "../components/ToastProvider";
import { api, type Order, type PaymentParams } from "./api";
import { loadRazorpay, openRazorpay } from "./razorpay";

export type PaymentOutcome = "paid" | "dismissed" | "error";

// Runs the whole online-payment step for an order that already exists on the server:
// open Razorpay, then ask the server to verify the result. The order only counts as
// paid when the server says so.
export default function useOnlinePayment(user?: { name: string; email: string } | null) {
  const { t } = useTranslation();
  const toast = useToast();

  return useCallback(
    async (order: Order, payment: PaymentParams, contact?: string): Promise<PaymentOutcome> => {
      try {
        await loadRazorpay();
      } catch {
        toast.error(t("toast.paymentUnavailable"));
        return "error";
      }

      const result = await openRazorpay(payment, {
        description: t("checkout.paymentDescription", { id: order._id.slice(-8).toUpperCase() }),
        prefill: { name: user?.name, email: user?.email, contact },
        onFailed: (message) => toast.error(message || t("toast.paymentFailed")),
      });
      if (result.status === "dismissed") {
        toast.info(t("toast.paymentCancelled"));
        return "dismissed";
      }

      try {
        await api.verifyPayment(order._id, result.response);
        toast.success(t("toast.paymentSuccess"));
        return "paid";
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t("toast.paymentFailed"));
        return "error";
      }
    },
    [t, toast, user?.name, user?.email],
  );
}
