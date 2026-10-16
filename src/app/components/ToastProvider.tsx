import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { inter } from "../lib/fonts";

type Kind = "success" | "error" | "info";
type Toast = { id: number; kind: Kind; message: string };

type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const MAX_VISIBLE = 3;
const DURATION: Record<Kind, number> = { success: 3500, info: 3500, error: 6000 };

const STYLE: Record<Kind, { box: string; icon: ReactNode }> = {
  success: {
    box: "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100",
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />,
  },
  error: {
    box: "bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100",
    icon: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />,
  },
  info: {
    box: "bg-white dark:bg-[#131B2E] border-[#E5E7EB] dark:border-white/10 text-[#111827] dark:text-gray-100",
    icon: <Info className="w-5 h-5 text-[#F97316] flex-shrink-0" />,
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((kind: Kind, message: string) => {
    if (!message) return;
    const id = nextId.current++;
    setToasts((prev) => [...prev.filter((x) => x.message !== message), { id, kind, message }].slice(-MAX_VISIBLE));
    timers.current.set(id, setTimeout(() => dismiss(id), DURATION[kind]));
  }, [dismiss]);

  const api = useMemo<ToastApi>(() => ({
    success: (m) => push("success", m),
    error: (m) => push("error", m),
    info: (m) => push("info", m),
  }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-20 inset-x-0 z-[80] flex flex-col items-center gap-2 px-4 pointer-events-none">
        {toasts.map((x) => (
          <div
            key={x.id}
            role={x.kind === "error" ? "alert" : "status"}
            className={`pointer-events-auto w-full max-w-sm flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 ${STYLE[x.kind].box}`}
          >
            <span className="mt-0.5">{STYLE[x.kind].icon}</span>
            <p className="flex-1 text-sm leading-snug" style={inter}>{x.message}</p>
            <button
              onClick={() => dismiss(x.id)}
              aria-label={t("toast.dismiss")}
              className="p-0.5 -mr-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
