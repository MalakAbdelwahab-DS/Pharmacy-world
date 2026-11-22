"use client";

import { MessageCircle } from "lucide-react";

import { dictionaries, type Lang } from "@/lib/i18n";
import { useApp } from "@/lib/store";

// Figma "Chat button": 60px blue circle, float shadow, bottom-right in English and bottom-left in Arabic
export function ChatButton({ lang }: { lang: Lang }) {
  const { chat, openChat, closeChat } = useApp();
  return (
    <button
      type="button"
      aria-label={dictionaries[lang].askAssistant}
      aria-expanded={chat.open}
      onClick={() => (chat.open ? closeChat() : openChat())}
      className="fixed bottom-8 end-8 z-40 size-[60px] rounded-full bg-blue text-white flex items-center justify-center shadow-[var(--shadow-float)]"
    >
      <MessageCircle size={26} strokeWidth={1.8} className="rtl:-scale-x-100" aria-hidden />
    </button>
  );
}
