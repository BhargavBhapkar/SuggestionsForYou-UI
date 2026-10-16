import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Bot, X, Send, Loader2, Sparkles } from "lucide-react";
import { inter, poppins } from "../lib/fonts";
import { api, type ChatMessage } from "../lib/api";

export default function ChatWidget() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setError(null);
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await api.sendChatMessage(next);
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("not_configured")) setError(t("chatbot.notConfigured"));
      else if (msg.toLowerCase().includes("many messages") || msg.includes("429")) setError(t("chatbot.rateLimited"));
      else setError(t("chatbot.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-[110] w-[calc(100%-2rem)] max-w-[380px] h-[min(70vh,560px)] bg-white dark:bg-[#131B2E] rounded-3xl shadow-2xl border border-[#E5E7EB] dark:border-white/10 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
          role="dialog"
          aria-label={t("chatbot.title")}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-[#111827] via-[#161f31] to-[#111827] px-4 py-3.5 flex items-center gap-3 flex-shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F97316] rounded-full blur-3xl opacity-[0.08] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="relative w-9 h-9 bg-[#F97316]/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#F97316]/20">
              <Bot className="w-5 h-5 text-[#F97316]" />
            </div>
            <div className="relative flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate" style={poppins}>{t("chatbot.title")}</p>
              <p className="text-[11px] text-gray-400 truncate" style={inter}>{t("chatbot.subtitle")}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label={t("chatbot.close")}
              className="relative p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#F8FAFC] dark:bg-[#0a0e1f]">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
              </div>
              <div className="max-w-[80%] bg-white dark:bg-[#1a2338] text-[#374151] dark:text-gray-200 text-sm rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-sm" style={inter}>
                {t("chatbot.greeting")}
              </div>
            </div>

            {messages.map((m, i) => (
              <div key={i} className={`flex items-start gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] text-sm px-3.5 py-2.5 shadow-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-[#F97316] text-white rounded-2xl rounded-br-sm"
                      : "bg-white dark:bg-[#1a2338] text-[#374151] dark:text-gray-200 rounded-2xl rounded-bl-sm"
                  }`}
                  style={inter}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
                </div>
                <div className="bg-white dark:bg-[#1a2338] text-[#9CA3AF] text-sm rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-sm flex items-center gap-1.5" style={inter}>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t("chatbot.thinking")}
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-lg px-3 py-2" style={inter}>
                {error}
              </p>
            )}
          </div>

          {/* Input */}
          <div className="flex-shrink-0 border-t border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#131B2E] p-3 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
              placeholder={t("chatbot.inputPlaceholder")}
              className="flex-1 px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-white/5 border border-[#E5E7EB] dark:border-white/10 rounded-xl text-sm text-[#111827] dark:text-white placeholder-[#9CA3AF] outline-none focus:border-[#F97316] transition-colors min-w-0"
              style={inter}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              aria-label={t("chatbot.send")}
              className="w-10 h-10 flex-shrink-0 bg-[#F97316] hover:bg-orange-600 disabled:opacity-40 disabled:hover:bg-[#F97316] text-white rounded-xl flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("chatbot.close") : t("chatbot.launcherLabel")}
        className="fixed bottom-4 right-4 sm:right-6 z-[110] w-14 h-14 rounded-full bg-white dark:bg-[#131B2E] shadow-2xl border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-200"
      >
        {open ? (
          <X className="w-5 h-5 text-[#6B7280] dark:text-gray-300" />
        ) : (
          <>
            <img src="/logo-80.png" alt="" className="w-8 h-8 rounded-full object-cover" />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5">
              <span className="block relative w-full h-full">
                <span className="absolute inset-0 rounded-full bg-[#F97316] animate-ping" />
                <span className="absolute inset-0 rounded-full bg-[#F97316] border-2 border-white dark:border-[#131B2E]" />
              </span>
            </span>
          </>
        )}
      </button>
    </>
  );
}
