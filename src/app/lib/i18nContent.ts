import type { Testimonial, Faq } from "./api";
import type { LanguageCode } from "../i18n";

export function localizedTestimonial(t: Testimonial, lang: string) {
  const tr = t.translations?.[lang as LanguageCode as "hi" | "gu"];
  return { role: tr?.role ?? t.role, text: tr?.text ?? t.text };
}

export function localizedFaq(f: Faq, lang: string) {
  const tr = f.translations?.[lang as LanguageCode as "hi" | "gu"];
  return { q: tr?.q ?? f.q, a: tr?.a ?? f.a };
}
