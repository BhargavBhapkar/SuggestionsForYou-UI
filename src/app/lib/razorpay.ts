import type { PaymentParams, RazorpaySuccess } from "./api";

type RazorpayFailure = { error?: { description?: string } };
type RazorpayInstance = { open(): void; on(event: "payment.failed", cb: (r: RazorpayFailure) => void): void };

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

const SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";
let loading: Promise<void> | null = null;

export function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error("Could not load Razorpay"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

export type PayResult = { status: "paid"; response: RazorpaySuccess } | { status: "dismissed" };

// Opens Razorpay Checkout. Resolves when the buyer pays or closes the window. A failed
// attempt (declined card etc.) keeps the window open so they can retry, and is reported
// through onFailed.
export function openRazorpay(
  payment: PaymentParams,
  opts: { description: string; prefill?: { name?: string; email?: string; contact?: string }; onFailed?: (message: string) => void },
): Promise<PayResult> {
  return new Promise((resolve) => {
    const rzp = new window.Razorpay!({
      key: payment.keyId,
      amount: payment.amount,
      currency: payment.currency,
      order_id: payment.razorpayOrderId,
      name: "SuggestionsForYou",
      description: opts.description,
      prefill: opts.prefill,
      theme: { color: "#F97316" },
      handler: (response: RazorpaySuccess) => resolve({ status: "paid", response }),
      modal: { ondismiss: () => resolve({ status: "dismissed" }) },
    });
    rzp.on("payment.failed", (r) => opts.onFailed?.(r.error?.description ?? ""));
    rzp.open();
  });
}
