"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { AccountShell } from "@/app/[lang]/account/AccountShell";
import { api, type ChatSummary } from "@/lib/api";
import { dictionaries, type Lang } from "@/lib/i18n";
import { useApp } from "@/lib/store";

// "Chat list": white tile radius 24; rows 24 x 16 padding with a 1px bottom divider (none on the last row)
export function ChatsView({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const { user, loadChat } = useApp();
  const [items, setItems] = useState<ChatSummary[] | null>(null);

  useEffect(() => {
    if (user) api.chats().then(setItems).catch(() => setItems([]));
  }, [user]);

  const open = async (c: ChatSummary) => {
    const full = await api.chat(c.id);
    loadChat(c.id, c.product_id ? { id: c.product_id, name: `${c.medicine} ${c.strength}` } : null, full.messages);
  };

  const date = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === "ar" ? "ar-JO-u-nu-latn" : "en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <AccountShell lang={lang} active="chats" count={items ? t.chatsCount(items.length) : null}>
      {items === null ? (
        <p className="t-body text-slate">{t.loading}</p>
      ) : items.length === 0 ? (
        <p className="t-body text-slate">{t.noChats}</p>
      ) : (
        <ul className="bg-white rounded-lg shadow-[var(--shadow-tile)] overflow-hidden">
          {items.map((c) => (
            <li key={c.id} className="border-b border-border last:border-b-0">
              <button type="button" onClick={() => open(c)} className="w-full flex items-center gap-4 px-6 py-4 text-start hover:bg-mist">
                <span className="flex-1 flex flex-col gap-1">
                  <span className="t-body text-ink">{c.title}</span>
                  <span className="t-caption text-slate">
                    {c.medicine && (
                      <>
                        <bdi>
                          {c.medicine} {c.strength}
                        </bdi>{" "}
                        ·{" "}
                      </>
                    )}
                    {date(c.created_at)}
                  </span>
                </span>
                <ChevronRight size={20} strokeWidth={1.8} className="text-slate rtl:-scale-x-100" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  );
}
