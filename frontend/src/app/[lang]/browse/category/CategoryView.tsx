"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { ResultsList } from "@/components/ResultsList";
import { Intro } from "@/components/ui";
import { api, type ListResponse } from "@/lib/api";
import { dictionaries, type Lang } from "@/lib/i18n";

// Figma "Browse / Category" (100:470): intro, sub-filter chips, filters, results grid, show more.
// The chips filter by the conditions inside this category.

export const emptyList = (slug: string): ListResponse => ({ slug, name_en: "", name_ar: "", total: 0, results: [], conditions: [] });
export function ListingPage({
  lang,
  parent,
  data,
}: {
  lang: Lang;
  parent: { label: string; href: string };
  data: ListResponse | null;
}) {
  const t = dictionaries[lang];
  const [chip, setChip] = useState<string | null>(null);
  const ar = lang === "ar";
  const title = data ? (ar ? data.name_ar : data.name_en) : "";
  const intro = data ? (ar ? data.text_ar ?? data.desc_ar : data.text_en ?? data.desc_en) : "";

  const chips = data?.conditions ?? [];
  const active = chips.find((c) => c.slug === chip);
  const results = (data?.results ?? []).filter((m) => !active || active.ids.includes(m.id));

  return (
    <div className="page pt-8 pb-20 flex flex-col gap-6">
      <Intro
        crumbs={[{ label: t.home, href: `/${lang}/` }, parent, { label: title }]}
        title={title}
        text={data ? `${intro ? `${intro} ` : ""}${t.categoryText(data.total)}` : undefined}
      />
      {data === null ? (
        <p className="t-body text-slate">{t.loading}</p>
      ) : (
        <>
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {[null, ...chips].map((c) => (
                <button
                  key={c?.slug ?? "all"}
                  type="button"
                  onClick={() => setChip(c?.slug ?? null)}
                  aria-pressed={chip === (c?.slug ?? null)}
                  className={`px-4 py-2 rounded-full t-label ${chip === (c?.slug ?? null) ? "bg-blue text-white" : "bg-tint-blue text-blue"}`}
                >
                  {c ? (ar ? c.name_ar : c.name_en) : t.all}
                </button>
              ))}
            </div>
          )}
          <ResultsList key={chip ?? "all"} lang={lang} results={results} moreLabel={t.showMoreMedicines} />
        </>
      )}
    </div>
  );
}

function Category({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const slug = useSearchParams().get("slug") ?? "";
  const [data, setData] = useState<ListResponse | null>(null);

  useEffect(() => {
    setData(null);
    api.category(slug).then(setData).catch(() => setData(emptyList(slug)));
  }, [slug]);

  return <ListingPage lang={lang} parent={{ label: t.browseCategoriesTitle, href: `/${lang}/browse/categories/` }} data={data} />;
}

export function CategoryView({ lang }: { lang: Lang }) {
  return (
    <Suspense>
      <Category lang={lang} />
    </Suspense>
  );
}
