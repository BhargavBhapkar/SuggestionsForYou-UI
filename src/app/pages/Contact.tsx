import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { useTranslation } from "react-i18next";
import { Mail, Send, Loader2, CheckCircle2 } from "lucide-react";
import { inter, poppins } from "../lib/fonts";
import { api, type ContactTopic } from "../lib/api";
import PageShell from "../components/PageShell";
import { useToast } from "../components/ToastProvider";
import { CONTACT_EMAIL } from "../data/legal";
import { BUSINESS } from "../data/business";
import type { AppContext } from "../Layout";

const TOPICS: ContactTopic[] = ["question", "suggestion", "order", "other"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldClass =
  "w-full px-3.5 py-2.5 bg-white dark:bg-white/5 border border-[#E5E7EB] dark:border-white/10 rounded-xl text-sm text-[#111827] dark:text-white placeholder-[#9CA3AF] outline-none focus:border-[#F97316] transition-colors";

export default function ContactPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToast();
  const { user } = useOutletContext<AppContext>();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [topic, setTopic] = useState<ContactTopic>("question");
  const [message, setMessage] = useState("");
  const [trap, setTrap] = useState(""); // honeypot, left empty by real visitors
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Only the details filled in on data/business.ts are listed.
  const details: { label: string; value: string; href?: string }[] = [
    { label: t("contact.legalName"), value: BUSINESS.legalName },
    { label: t("contact.address"), value: BUSINESS.address || t("footer.address") },
    { label: t("contact.phone"), value: BUSINESS.phone, href: `tel:${BUSINESS.phone.replace(/[^\d+]/g, "")}` },
    { label: t("contact.emailLabel"), value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
    { label: t("contact.hours"), value: BUSINESS.hours },
    { label: t("contact.gstin"), value: BUSINESS.gstin },
    { label: t("contact.grievanceOfficer"), value: BUSINESS.grievanceOfficer },
  ].filter((row) => row.value);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error(t("contact.errName"));
    if (!EMAIL_RE.test(email.trim())) return toast.error(t("contact.errEmail"));
    if (message.trim().length < 10) return toast.error(t("contact.errMessage"));

    setSending(true);
    try {
      await api.sendContactMessage({ name: name.trim(), email: email.trim(), topic, message: message.trim(), website: trap });
      setSent(true);
      setMessage("");
    } catch (err) {
      toast.error(err instanceof TypeError || !(err instanceof Error) ? t("contact.failed", { email: CONTACT_EMAIL }) : err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <PageShell onBack={() => navigate("/")} title={t("contact.title")} subtitle="" icon={<Mail className="w-6 h-6 text-[#F97316]" />}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 bg-orange-50 dark:bg-orange-950/40 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Mail className="w-6 h-6 text-[#F97316]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white" style={poppins}>{t("contact.title")}</h1>
        </div>
        <p className="text-sm text-[#6B7280] dark:text-gray-400 mb-8" style={inter}>{t("contact.subtitle")}</p>

        {sent ? (
          <div role="status" className="bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-[#111827] dark:text-white mb-2" style={poppins}>{t("contact.sentTitle")}</h2>
            <p className="text-sm text-[#6B7280] dark:text-gray-400 mb-6" style={inter}>{t("contact.sentBody")}</p>
            <button
              onClick={() => setSent(false)}
              className="px-5 py-2.5 border border-[#E5E7EB] dark:border-white/10 rounded-xl text-sm font-medium text-[#374151] dark:text-gray-300 hover:border-[#F97316] hover:text-[#F97316] transition-colors"
              style={poppins}
            >
              {t("contact.sendAnother")}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-5 sm:p-7 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="contact-name" className="block text-xs font-semibold text-[#374151] dark:text-gray-300 mb-1.5" style={inter}>{t("contact.name")}</label>
                <input id="contact-name" name="name" autoComplete="name" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} style={inter} />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-xs font-semibold text-[#374151] dark:text-gray-300 mb-1.5" style={inter}>{t("contact.email")}</label>
                <input id="contact-email" name="email" type="email" autoComplete="email" maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} style={inter} />
              </div>
            </div>

            <div>
              <label htmlFor="contact-topic" className="block text-xs font-semibold text-[#374151] dark:text-gray-300 mb-1.5" style={inter}>{t("contact.topic")}</label>
              <select id="contact-topic" name="topic" value={topic} onChange={(e) => setTopic(e.target.value as ContactTopic)} className={fieldClass} style={inter}>
                {TOPICS.map((k) => <option key={k} value={k}>{t(`contact.topics.${k}`)}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-xs font-semibold text-[#374151] dark:text-gray-300 mb-1.5" style={inter}>{t("contact.message")}</label>
              <textarea id="contact-message" name="message" rows={6} maxLength={4000} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t("contact.messagePlaceholder")} className={`${fieldClass} resize-y`} style={inter} />
            </div>

            {/* Honeypot: invisible to people and screen readers, bots tend to fill it in. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>Website<input tabIndex={-1} autoComplete="off" name="website" value={trap} onChange={(e) => setTrap(e.target.value)} /></label>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#F97316] hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all"
              style={poppins}
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? t("contact.sending") : t("contact.send")}
            </button>
          </form>
        )}

        <section aria-labelledby="business-details" className="mt-8 bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-5 sm:p-7">
          <h2 id="business-details" className="font-bold text-[#111827] dark:text-white mb-4" style={poppins}>{t("contact.detailsHeading")}</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-x-6 gap-y-3 text-sm" style={inter}>
            {details.map((row) => (
              <div key={row.label} className="contents">
                <dt className="text-[#6B7280] dark:text-gray-400">{row.label}</dt>
                <dd className="text-[#111827] dark:text-white break-words">
                  {row.href ? <a href={row.href} className="hover:text-[#F97316] transition-colors">{row.value}</a> : row.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </PageShell>
  );
}
