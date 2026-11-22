"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { MedicineCard } from "@/components/MedicineCard";
import { api, type SearchResponse } from "@/lib/api";
import { dictionaries, type Lang } from "@/lib/i18n";

function Results({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const q = useSearchParams().get("q") ?? "";
  const [data, setData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (q.length < 2) return;
    setData(null);
    setError(false);
    api.search(q).then(setData).catch(() => setError(true));
  }, [q]);

  if (error) return <p className="text-danger">{t.error}</p>;
  if (!data) return <p className="text-slate">{t.loading}</p>;

  if (data.total === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <h1 className="text-2xl font-semibold">{t.noResults(q)}</h1>
        {data.did_you_mean && (
          <p className="mt-2 text-slate">
            {t.didYouMean}{" "}
            <Link className="text-blue font-medium" href={`/${lang}/search/?q=${encodeURIComponent(data.did_you_mean)}`}>
              {data.did_you_mean}
            </Link>
            ?
          </p>
        )}
        <p className="mt-2 text-slate">{t.noResultsHelp}</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">{t.results(data.total, q)}</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.results.map((m) => (
          <MedicineCard key={m.id} medicine={m} lang={lang} />
        ))}
      </div>
      <p className="text-xs text-slate mt-6">{t.priceNote}</p>
    </>
  );
}

export function SearchResults({ lang }: { lang: Lang }) {
  return (
    <Suspense>
      <Results lang={lang} />
    </Suspense>
  );
}
