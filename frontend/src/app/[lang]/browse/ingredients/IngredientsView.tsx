"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Intro } from "@/components/ui";
import { api, type Ingredient } from "@/lib/api";
import { dictionaries, type Lang } from "@/lib/i18n";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Figma "Browse / All ingredients" (102:1951): filter box + A-Z bar, then one white tile with a section per letter
export function IngredientsView({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const [items, setItems] = useState<Ingredient[] | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    api.ingredients().then((r) => setItems(r.items)).catch(() => setItems([]));
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, Ingredient[]>();
    (items ?? [])
      .filter((i) => i.name_en.toLowerCase().includes(filter.trim().toLowerCase()))
      .forEach((i) => {
        const letter = i.name_en[0].toUpperCase();
        map.set(letter, [...(map.get(letter) ?? []), i]);
      });
    return map;
  }, [items, filter]);

  return (
    <div className="page pt-8 pb-20 flex flex-col gap-6">
      <Intro crumbs={[{ label: t.home, href: `/${lang}/` }, { label: t.browseIngredientsTitle }]} title={t.browseIngredientsTitle} text={t.browseIngredientsText} />
      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-3 h-[52px] px-4 w-full md:w-[400px] bg-white border-[1.5px] border-border-strong rounded-md focus-within:border-2 focus-within:border-blue">
          <Search size={20} strokeWidth={1.8} className="text-slate" aria-hidden />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={t.filterIngredients}
            aria-label={t.filterIngredients}
            className="flex-1 bg-transparent outline-none t-body text-ink placeholder:text-slate"
          />
        </label>
        <nav className="flex flex-wrap gap-x-2 t-label" dir="ltr" aria-label="A–Z">
          {ALPHABET.map((l) =>
            groups.has(l) ? (
              <a key={l} href={`#letter-${l}`} className="text-blue">
                {l}
              </a>
            ) : (
              <span key={l} className="text-slate opacity-50">
                {l}
              </span>
            ),
          )}
        </nav>
      </div>
      {items === null ? (
        <p className="t-body text-slate">{t.loading}</p>
      ) : (
        <div className="bg-white rounded-lg shadow-[var(--shadow-tile)] p-8 flex flex-col gap-8" dir="ltr">
          {[...groups.entries()].map(([letter, list]) => (
            <section key={letter} id={`letter-${letter}`} className="flex flex-col gap-3 scroll-mt-8">
              <h2 className="t-h2 text-ink">{letter}</h2>
              <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                {list.map((i) => (
                  <li key={i.id}>
                    <Link href={`/${lang}/search/?q=${encodeURIComponent(i.name_en)}`} className="t-body text-ink hover:text-blue">
                      {i.name_en}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
