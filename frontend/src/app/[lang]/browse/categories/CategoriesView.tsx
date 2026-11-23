"use client";

import { useEffect, useState } from "react";

import { BrowseTile, Intro } from "@/components/ui";
import { api, type Category } from "@/lib/api";
import { dictionaries, type Lang } from "@/lib/i18n";

// Figma "Browse / All categories" (101:631): intro + 4-column grid of category tiles
export function CategoriesView({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const [items, setItems] = useState<Category[] | null>(null);

  useEffect(() => {
    api.categories().then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <div className="page pt-8 pb-20 flex flex-col gap-6">
      <Intro crumbs={[{ label: t.home, href: `/${lang}/` }, { label: t.browseCategoriesTitle }]} title={t.browseCategoriesTitle} text={t.browseCategoriesText} />
      {items === null ? (
        <p className="t-body text-slate">{t.loading}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((c) => (
            <BrowseTile
              key={c.slug}
              href={`/${lang}/browse/category/?slug=${c.slug}`}
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
