import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "../components/ToastProvider";

interface SpeechResultEvent { results: ArrayLike<ArrayLike<{ transcript: string }>> }
interface Recognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: SpeechResultEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
type RecognitionCtor = new () => Recognition;

const LANG_TAGS: Record<string, string> = { en: "en-IN", hi: "hi-IN", gu: "gu-IN" };

function getCtor(): RecognitionCtor | undefined {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function useVoiceSearch(onResult: (text: string) => void) {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const [listening, setListening] = useState(false);
  const recRef = useRef<Recognition | null>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => () => recRef.current?.stop(), []);

  const toggle = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) {
      toast.error(t("toast.voiceUnsupported"));
      return;
    }
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new Ctor();
    rec.lang = LANG_TAGS[i18n.language] ?? "en-IN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript?.trim();
      if (text) onResultRef.current(text);
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") toast.error(t("toast.voiceDenied"));
      else if (e.error !== "aborted") toast.error(t("toast.voiceError"));
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [listening, i18n.language, t, toast]);

  return { listening, toggle };
}
