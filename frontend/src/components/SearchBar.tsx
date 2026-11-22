"use client";

import { Mic, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { dictionaries, type Lang } from "@/lib/i18n";
import { looksLikeQuestion, useApp } from "@/lib/store";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  onresult: ((e: { results: { 0: { transcript: string } }[] }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
};

// Figma "Search bar": white, 1.5px border-strong, radius 12, 20px icons, mic in a tint-blue circle.
// Default 52px tall (header); large 64px tall (home hero). Questions go to the AI assistant.
function SearchBarInner({
  lang,
  size,
  placeholder,
  onSubmit,
}: {
  lang: Lang;
  size: "default" | "large";
  placeholder?: string;
  onSubmit?: (text: string) => void;
}) {
  const t = dictionaries[lang];
  const router = useRouter();
  const params = useSearchParams();
  const { openChat, ask } = useApp();
  const [q, setQ] = useState(onSubmit ? "" : params.get("q") ?? "");
  const [notice, setNotice] = useState<string | null>(null);
  const large = size === "large";

  useEffect(() => {
    if (!onSubmit) setQ(params.get("q") ?? "");
  }, [params, onSubmit]);

  const submit = (text: string) => {
    const value = text.trim();
    if (!value) return;
    if (onSubmit) {
      onSubmit(value);
      setQ("");
      return;
    }
    if (looksLikeQuestion(value)) {
      openChat();
      ask(value);
      setQ("");
      return;
    }
    if (value.length >= 2) router.push(`/${lang}/search/?q=${encodeURIComponent(value)}`);
  };

  const listen = () => {
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
    const Recognition = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Recognition) {
      setNotice(t.voiceUnsupported);
      return;
    }
    const rec = new Recognition();
    rec.lang = lang === "ar" ? "ar-JO" : "en-US";
    rec.interimResults = false;
    setNotice(t.listening);
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setQ(text);
      submit(text);
    };
    rec.onend = () => setNotice(null);
    rec.start();
  };

  return (
    <div className="w-full">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit(q);
        }}
        className={`flex items-center gap-3 bg-white border-[1.5px] border-border-strong rounded-md w-full focus-within:border-2 focus-within:border-blue ${
          large ? "h-16 px-6" : "h-[52px] px-4"
        }`}
      >
        <Search size={20} strokeWidth={1.8} className="text-slate shrink-0" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder ?? t.searchPlaceholder}
          aria-label={placeholder ?? t.searchPlaceholder}
          dir="auto"
          className="flex-1 min-w-0 bg-transparent outline-none t-body text-ink placeholder:text-slate"
        />
        <button type="button" onClick={listen} aria-label={t.voiceSearch} className="shrink-0 p-2 rounded-full bg-tint-blue text-blue">
          <Mic size={20} strokeWidth={1.8} aria-hidden />
        </button>
      </form>
      {notice && <p className="t-caption text-slate mt-1" role="status">{notice}</p>}
    </div>
  );
}

export function SearchBar({
  lang,
  size = "default",
  placeholder,
  onSubmit,
}: {
  lang: Lang;
  size?: "default" | "large";
  placeholder?: string;
  onSubmit?: (text: string) => void;
}) {
  return (
    <Suspense>
      <SearchBarInner lang={lang} size={size} placeholder={placeholder} onSubmit={onSubmit} />
    </Suspense>
  );
}
