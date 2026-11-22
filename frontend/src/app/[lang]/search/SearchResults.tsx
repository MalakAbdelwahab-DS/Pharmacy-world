"use client";

import { SearchX } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { MedicineCard } from "@/components/MedicineCard";
import { Button } from "@/components/ui";
import { api, type Category, type SearchResponse } from "@/lib/api";
import { dictionaries, type Lang } from "@/lib/i18n";

const PAGE_SIZE = 6;

// Figma "Search results / Desktop / EN" (74:1186) and "Search results / No results"
function Results({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const q = useSearchParams().get("q") ?? "";
  const [data, setData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState(false);
  const [shown, setShown] = useState(PAGE_SIZE);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (q.length < 2) return;
    setData(null);
    setError(false);
    setShown(PAGE_SIZE);
    const timer = setTimeout(() => setSlow(true), 3000);
    api
      .search(q)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => clearTimeout(timer));
    return () => clearTimeout(timer);
  }, [q]);

  if (error) return <p className="t-body text-danger">{t.error}</p>;
  if (!data) return <p className="t-body text-slate">{slow ? t.wakingUp : t.loading}</p>;
  if (data.total === 0) return <NoResults lang={lang} q={q} suggestion={data.did_you_mean} />;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="t-h2 text-ink">{t.results(data.total, q)}</h1>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {t.filters.map((f) => (
            <Button key={f} style="secondary">
              {f} ▾
            </Button>
          ))}
        </div>
        <Button style="ghost">{t.sort} ▾</Button>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.results.slice(0, shown).map((m) => (
          <MedicineCard key={m.id} medicine={m} lang={lang} />
        ))}
      </div>
      {shown < data.total && (
        <div className="flex justify-center">
          <Button style="secondary" onClick={() => setShown(shown + PAGE_SIZE)}>
            {t.showMore}
          </Button>
        </div>
      )}
    </div>
  );
}

function NoResults({ lang, q, suggestion }: { lang: Lang; q: string; suggestion: string | null }) {
  const t = dictionaries[lang];
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api
      .categories()
      .then((all) => setCategories([...all].sort((a, b) => b.medicines - a.medicines).slice(0, 4)))
      .catch(() => setCategories([]));
  }, []);

  return (
    <div className="flex flex-col items-center gap-16">
      <div className="w-full max-w-[560px] flex flex-col items-center gap-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <SearchX size={48} strokeWidth={1.8} className="text-slate" aria-hidden />
          <div className="flex flex-col gap-2">
            <h1 className="t-h2 text-ink">{t.noResults(q)}</h1>
            {suggestion && (
              <p className="t-body text-slate">
                {t.didYouMean}{" "}
                <Link className="t-label text-blue" href={`/${lang}/search/?q=${encodeURIComponent(suggestion)}`}>
                  {suggestion}
                </Link>
                ?
              </p>
            )}
            <p className="t-body text-slate">{t.noResultsHelp}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button style="secondary">{t.searchWithPhoto}</Button>
          <Button style="ghost">{t.browseCategories}</Button>
        </div>
      </div>
      {categories.length > 0 && (
        <section className="w-full flex flex-col gap-6">
          <h2 className="t-h2 text-ink text-center">{t.browseByCategory}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <div key={c.name} className="bg-white rounded-lg shadow-[var(--shadow-tile)] p-6 flex flex-col gap-2">
                <h3 className="t-h3 text-ink">{c.name}</h3>
                <p className="t-caption text-slate">{c.examples.join(", ")}</p>
                <span className="mt-auto t-label text-blue">{t.medicinesCount(c.medicines)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function SearchResults({ lang }: { lang: Lang }) {
  return (
    <div className="page pt-8 pb-20">
      <Suspense>
        <Results lang={lang} />
      </Suspense>
    </div>
  );
}
