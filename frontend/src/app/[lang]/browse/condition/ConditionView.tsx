"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { ListingPage } from "@/app/[lang]/browse/category/CategoryView";
import { api, type ListResponse } from "@/lib/api";
import { dictionaries, type Lang } from "@/lib/i18n";

function Condition({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const slug = useSearchParams().get("slug") ?? "";
  const [data, setData] = useState<(ListResponse & { name_en: string; name_ar: string }) | null>(null);

  useEffect(() => {
    setData(null);
    api.condition(slug).then(setData).catch(() => setData({ total: 0, results: [], name_en: slug, name_ar: slug }));
  }, [slug]);

  const title = data ? (lang === "ar" ? data.name_ar : data.name_en) : "";
  return <ListingPage lang={lang} title={title} parent={{ label: t.browseConditionsTitle, href: `/${lang}/browse/conditions/` }} data={data} />;
}

export function ConditionView({ lang }: { lang: Lang }) {
  return (
    <Suspense>
      <Condition lang={lang} />
    </Suspense>
  );
}
