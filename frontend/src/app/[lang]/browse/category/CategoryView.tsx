"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { ResultsList } from "@/components/ResultsList";
import { Intro } from "@/components/ui";
import { api, type ListResponse } from "@/lib/api";
import { dictionaries, type Lang } from "@/lib/i18n";

// Figma "Browse / Category" (100:470): intro, sub-filter chips, filters, results grid, show more.
// The chips filter by active ingredient until the pharmacist defines sub-groups.
export function ListingPage({
  lang,
  title,
  parent,
  data,
}: {
  lang: Lang;
  title: string;
  parent: { label: string; href: string };
  data: ListResponse | null;
}) {
  const t = dictionaries[lang];
  const [chip, setChip] = useState<string | null>(null);

  const chips = useMemo(() => {
    const counts = new Map<string, number>();
    (data?.results ?? []).forEach((m) => counts.set(m.ingredients, (counts.get(m.ingredients) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name]) => name);
  }, [data]);

  const results = (data?.results ?? []).filter((m) => !chip || m.ingredients === chip);

  return (
    <div className="page pt-8 pb-20 flex flex-col gap-6">
      <Intro
        crumbs={[{ label: t.home, href: `/${lang}/` }, parent, { label: title }]}
        title={title}
        text={data ? t.categoryText(data.total) : undefined}
      />
      {data === null ? (
        <p className="t-body text-slate">{t.loading}</p>
      ) : (
        <>
          {chips.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {[null, ...chips].map((c) => (
                <button
                  key={c ?? "all"}
                  type="button"
                  onClick={() => setChip(c)}
                  aria-pressed={chip === c}
                  className={`px-4 py-2 rounded-full t-label ${chip === c ? "bg-blue text-white" : "bg-tint-blue text-blue"}`}
                >
                  <bdi>{c ?? t.all}</bdi>
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
  const name = useSearchParams().get("name") ?? "";
  const [data, setData] = useState<ListResponse | null>(null);

  useEffect(() => {
    setData(null);
    api.category(name).then(setData).catch(() => setData({ total: 0, results: [] }));
  }, [name]);

  return <ListingPage lang={lang} title={name} parent={{ label: t.browseCategoriesTitle, href: `/${lang}/browse/categories/` }} data={data} />;
}

export function CategoryView({ lang }: { lang: Lang }) {
  return (
    <Suspense>
      <Category lang={lang} />
    </Suspense>
  );
}
