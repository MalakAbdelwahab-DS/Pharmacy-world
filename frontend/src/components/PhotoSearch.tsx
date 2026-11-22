"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { Button, Chip } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { dictionaries, type Lang } from "@/lib/i18n";

// "Search with a photo": the site shows what it read and the person picks before searching
export function PhotoSearch({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "reading" | "found" | "nothing" | "unavailable">("idle");
  const [found, setFound] = useState<string[]>([]);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setState("reading");
    try {
      const res = await api.photo(file);
      setFound(res.found);
      setState(res.found.length ? "found" : "nothing");
    } catch (e) {
      setState(e instanceof ApiError && e.status === 503 ? "unavailable" : "nothing");
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <input ref={input} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      <Button style="secondary" onClick={() => input.current?.click()}>
        {t.searchWithPhoto}
      </Button>
      {state !== "idle" && (
        <div className="t-body-sm text-slate text-center flex flex-col items-center gap-2" role="status">
          {state === "reading" && <p>{t.photoReading}</p>}
          {state === "found" && (
            <>
              <p className="text-ink">{t.photoFound}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {found.map((name) => (
                  <Chip key={name} href={`/${lang}/search/?q=${encodeURIComponent(name.split(" ")[0])}`}>
                    <bdi>{name}</bdi>
                  </Chip>
                ))}
              </div>
              <p>{t.photoConfirm}</p>
            </>
          )}
          {state === "nothing" && <p>{t.photoNothing}</p>}
          {state === "unavailable" && <p>{t.photoUnavailable}</p>}
          <p className="t-caption">{t.photoNote}</p>
        </div>
      )}
    </div>
  );
}

export function BrowseCategoriesLink({ lang }: { lang: Lang }) {
  return (
    <Link href={`/${lang}/browse/categories/`} className="inline-flex items-center px-6 py-3 rounded-full t-label text-blue">
      {dictionaries[lang].browseCategories}
    </Link>
  );
}
