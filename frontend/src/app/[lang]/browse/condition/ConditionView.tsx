"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { emptyList, ListingPage } from "@/app/[lang]/browse/category/CategoryView";
import { api, type ListResponse } from "@/lib/api";
import { dictionaries, type Lang } from "@/lib/i18n";

function Condition({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const slug = useSearchParams().get("slug") ?? "";
  const [data, setData] = useState<ListResponse | null>(null);

  useEffect(() => {
    setData(null);
    api.condition(slug).then(setData).catch(() => setData(emptyList(slug)));
  }, [slug]);

  return <ListingPage lang={lang} parent={{ label: t.browseConditionsTitle, href: `/${lang}/browse/conditions/` }} data={data} />;
}

export function ConditionView({ lang }: { lang: Lang }) {
  return (
    <Suspense>
      <Condition lang={lang} />
    </Suspense>
  );
}
