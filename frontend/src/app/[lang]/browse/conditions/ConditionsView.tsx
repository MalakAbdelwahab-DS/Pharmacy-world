"use client";

import { useEffect, useState } from "react";

import { BrowseTile, Intro } from "@/components/ui";
import { api, type Condition } from "@/lib/api";
import { dictionaries, type Lang } from "@/lib/i18n";

// Figma "Browse / All conditions" (102:1853): same layout as categories
export function ConditionsView({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const [items, setItems] = useState<Condition[] | null>(null);

  useEffect(() => {
    api.conditions().then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <div className="page pt-8 pb-20 flex flex-col gap-6">
      <Intro crumbs={[{ label: t.home, href: `/${lang}/` }, { label: t.browseConditionsTitle }]} title={t.browseConditionsTitle} text={t.browseConditionsText} />
      {items === null ? (
        <p className="t-body text-slate">{t.loading}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((c) => (
            <BrowseTile
              key={c.slug}
              href={`/${lang}/browse/condition/?slug=${c.slug}`}
              title={lang === "ar" ? c.name_ar : c.name_en}
              examples={c.examples.join(", ")}
              count={t.medicinesCount(c.medicines)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
