import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Lock, Sparkles, Loader2 } from "lucide-react";
import { inter, poppins } from "../lib/fonts";

export default function LoginModal({
  onClose,
  login,
  signup,
}: {
  onClose: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") await login(email, password);
      else await signup(name, email, password);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-[#131B2E] rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-[#E5E7EB] dark:border-white/10"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white hover:bg-[#F3F4F6] dark:hover:bg-white/10 transition-all">
          <X className="w-4 h-4" />
        </button>
        <div className="w-14 h-14 bg-orange-50 dark:bg-orange-950/40 rounded-2xl flex items-center justify-center mb-5 mx-auto">
          <Lock className="w-6 h-6 text-[#F97316]" />
        </div>
        <h3 className="text-xl font-bold text-[#111827] dark:text-white text-center mb-2" style={poppins}>
          {mode === "login" ? t("common.signIn") : t("auth.createFreeAccount")}
        </h3>
        <p className="text-sm text-[#6B7280] dark:text-gray-400 text-center mb-6 leading-relaxed" style={inter}>
          {t("auth.subtitle")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 mb-4">
          {mode === "signup" && (
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("auth.fullNamePlaceholder")}
              className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-white/5 border border-[#E5E7EB] dark:border-white/10 rounded-xl text-sm text-[#111827] dark:text-white placeholder-[#9CA3AF] outline-none focus:border-[#F97316] transition-colors"
              style={inter}
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.emailPlaceholder")}
            className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-white/5 border border-[#E5E7EB] dark:border-white/10 rounded-xl text-sm text-[#111827] dark:text-white placeholder-[#9CA3AF] outline-none focus:border-[#F97316] transition-colors"
            style={inter}
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("auth.passwordPlaceholder")}
            className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-white/5 border border-[#E5E7EB] dark:border-white/10 rounded-xl text-sm text-[#111827] dark:text-white placeholder-[#9CA3AF] outline-none focus:border-[#F97316] transition-colors"
            style={inter}
          />

          {error && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-lg px-3 py-2" style={inter}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-200 disabled:opacity-60 disabled:hover:translate-y-0"
            style={poppins}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {mode === "login" ? t("common.signIn") : t("auth.createAccount")}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
          className="w-full py-2.5 text-sm text-[#374151] dark:text-gray-300 hover:text-[#F97316] transition-colors" style={inter}
        >
          {mode === "login" ? t("auth.newHereLink") : t("auth.alreadyHaveAccountLink")}
        </button>
        <button onClick={onClose} className="w-full py-1.5 text-sm text-[#9CA3AF] hover:text-[#374151] dark:hover:text-gray-200 transition-colors" style={inter}>
          {t("auth.continueBrowsing")}
        </button>
      </div>
    </div>
  );
}
