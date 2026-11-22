"use client";

import { useEffect, useState } from "react";

import { AccountShell } from "@/app/[lang]/account/AccountShell";
import { MedicineCard } from "@/components/MedicineCard";
import { Button } from "@/components/ui";
import { api, type MedicineCard as Card } from "@/lib/api";
import { dictionaries, type Lang } from "@/lib/i18n";
import { useApp } from "@/lib/store";

// Each saved item: medicine card + Ghost "Remove" button, 8px apart
export function SavedView({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const { user } = useApp();
  const [items, setItems] = useState<Card[] | null>(null);

  useEffect(() => {
    if (user) api.saved().then(setItems).catch(() => setItems([]));
  }, [user]);

  return (
    <AccountShell lang={lang} active="saved" count={items ? t.savedCount(items.length) : null}>
      {items === null ? (
        <p className="t-body text-slate">{t.loading}</p>
      ) : items.length === 0 ? (
        <p className="t-body text-slate">{t.noSaved}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <div key={m.id} className="flex flex-col gap-2 items-start">
              <div className="w-full flex-1">
                <MedicineCard medicine={m} lang={lang} />
              </div>
              <Button
                style="ghost"
                onClick={async () => {
                  await api.unsave(m.id);
                  setItems(items.filter((x) => x.id !== m.id));
                }}
              >
                {t.remove}
              </Button>
            </div>
          ))}
        </div>
      )}
    </AccountShell>
  );
}
