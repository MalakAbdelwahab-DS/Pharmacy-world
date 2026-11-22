"use client";

import { ChevronRight, Link2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { SearchBar } from "@/components/SearchBar";
import { buttonClass } from "@/components/ui";
import { dictionaries, type Lang } from "@/lib/i18n";
import { useApp, type PanelMessage } from "@/lib/store";

// Figma "AI assistant / States" (93:261): 360 x 640 panel, radius 24, float shadow.
// States: start (greeting + suggestions), thinking, answer with sources, no verified information, safety.
export function ChatPanel({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const { chat, closeChat, clearMedicine, ask } = useApp();
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [chat.messages, chat.open]);

  if (!chat.open) return null;
  const medicine = chat.medicine;

  return (
    <section
      role="dialog"
      aria-label={t.assistantTitle}
      className="fixed z-40 inset-0 md:inset-auto md:end-8 md:bottom-[108px] md:w-[360px] md:h-[640px] md:max-h-[calc(100vh-140px)] bg-white md:rounded-lg shadow-[var(--shadow-float)] flex flex-col overflow-hidden"
    >
      <header className="flex items-start gap-2 px-4 py-3 border-b border-border">
        <div className="flex-1">
          <h2 className="t-label text-ink">{t.assistantTitle}</h2>
          <p className="t-caption text-slate">{t.assistantSubtitle}</p>
        </div>
        <button type="button" onClick={closeChat} aria-label={t.close} className="p-1 text-ink">
          <X size={16} strokeWidth={2} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-end gap-3">
        {chat.messages.length === 0 && (
          <>
            <Bubble>{medicine ? t.greetingMedicine(medicine.name) : t.greeting}</Bubble>
            {medicine && (
              <div className="flex flex-col items-start gap-2">
                {t.suggestions.map((s) => (
                  <button key={s} type="button" onClick={() => ask(s)} className="px-3 py-[6px] rounded-full border border-blue text-blue t-label text-start">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        {chat.messages.map((m, i) => (
          <Message key={i} message={m} lang={lang} />
        ))}
        <div ref={end} />
      </div>

      <footer className="border-t border-border p-4 flex flex-col gap-2">
        {medicine && (
          <span className="self-start inline-flex items-center gap-1 px-3 py-1 rounded-full bg-tint-blue text-blue t-label">
            <Link2 size={14} strokeWidth={2} aria-hidden />
            {t.askingAbout}: <bdi>{medicine.name}</bdi>
            <button type="button" onClick={clearMedicine} aria-label={t.clear} className="ms-1">
              <X size={14} strokeWidth={2} />
            </button>
          </span>
        )}
        <SearchBar lang={lang} placeholder={medicine ? t.askThisMedicine : t.askAnything} onSubmit={(text) => ask(text)} />
      </footer>
    </section>
  );
}

function Bubble({ children, user, tone }: { children: React.ReactNode; user?: boolean; tone?: "safety" }) {
  const style = user ? "self-end bg-blue text-white" : tone === "safety" ? "self-start bg-tint-red text-ink" : "self-start bg-mist text-ink";
  return <div className={`max-w-[85%] rounded-md px-3 py-2 t-body whitespace-pre-line ${style}`}>{children}</div>;
}

function Message({ message: m, lang }: { message: PanelMessage; lang: Lang }) {
  const t = dictionaries[lang];
  const { closeChat } = useApp();

  if (m.role === "user") return <Bubble user>{m.content}</Bubble>;
  if (m.kind === "thinking") return <div className="self-start rounded-md px-3 py-2 bg-mist t-body text-slate">{t.thinking}</div>;

  if (m.kind === "safety") {
    return (
      <Bubble tone="safety">
        <span className="block t-label text-danger mb-2">{t.safetyTitle}</span>
        {t.safetyText}
        <span className="block mt-3">
          <a href="tel:911" className={buttonClass("primary")}>
            {t.call911}
          </a>
        </span>
        <span className="block t-caption text-slate mt-2">{t.safetyLaptop}</span>
      </Bubble>
    );
  }

  if (m.kind === "no_info") {
    return (
      <>
        <Bubble>{t.noInfo}</Bubble>
        <Link
          href={`/${lang}/`}
          onClick={closeChat}
          className={buttonClass("secondary", "self-start")}
        >
          {t.searchMedicines}
        </Link>
      </>
    );
  }

  return (
    <>
      <Bubble>{m.content}</Bubble>
      {m.sources.map((s) => (
        <Link
          key={`${s.medicine_id}-${s.reference}`}
          href={`/${lang}/medicine/?id=${s.medicine_id}`}
          className="self-start max-w-[85%] border border-border rounded-md px-3 py-2 flex items-center gap-2"
        >
          <span className="flex-1">
            <span className="block t-caption text-slate uppercase">{t.source}</span>
            <bdi className="block t-label text-ink">{s.name}</bdi>
            <span className="block t-caption text-slate">
              {t.ref}: {s.reference}
              {s.last_updated && ` · ${t.updated} ${s.last_updated}`}
            </span>
          </span>
          <ChevronRight size={16} strokeWidth={1.8} className="text-slate rtl:-scale-x-100" aria-hidden />
        </Link>
      ))}
    </>
  );
}
