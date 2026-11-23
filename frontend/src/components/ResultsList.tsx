"use client";

import { useMemo, useState } from "react";

import { Dropdown } from "@/components/Dropdown";
import { MedicineCard } from "@/components/MedicineCard";
import { Button } from "@/components/ui";
import type { MedicineCard as Card } from "@/lib/api";
import { dictionaries, type Lang } from "@/lib/i18n";

const PAGE_SIZE = 6;
const PRICE_RANGES: [number, number][] = [[0, 1], [1, 5], [5, 20], [20, Infinity]];
type SortKey = "unit" | "price" | "name";

const unique = (values: (string | null)[]) => [...new Set(values.filter((v): v is string => !!v))].sort();

// Figma "Filters row" + "Results grid" + "Show more", shared by search results and the browse pages.
// Sponsored medicines stay on top (labelled); everything else follows the chosen sort.
export function ResultsList({ lang, results, moreLabel }: { lang: Lang; results: Card[]; moreLabel?: string }) {
  const t = dictionaries[lang];
  const [forms, setForms] = useState<string[]>([]);
  const [rx, setRx] = useState<string[]>([]);
  const [makers, setMakers] = useState<string[]>([]);
  const [prices, setPrices] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>("unit");
  const [shown, setShown] = useState(PAGE_SIZE);

  const toggle = (list: string[], set: (v: string[]) => void) => (value: string) =>
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

  const filtered = useMemo(() => {
    const keep = results.filter(
      (m) =>
        (!forms.length || forms.includes(m.dosage_form)) &&
        (!rx.length || rx.includes(m.rx_status ?? "")) &&
        (!makers.length || makers.includes(m.manufacturer ?? "")) &&
        (!prices.length ||
          prices.some((i) => {
            const [lo, hi] = PRICE_RANGES[Number(i)];
            return m.from_price != null && m.from_price >= lo && m.from_price < hi;
          })),
    );
    const byPrice = (a: number | null, b: number | null) => (a ?? Infinity) - (b ?? Infinity);
    const sorter: Record<SortKey, (a: Card, b: Card) => number> = {
      unit: (a, b) => byPrice(a.price_per_unit, b.price_per_unit),
      price: (a, b) => byPrice(a.from_price, b.from_price),
      name: (a, b) => a.trade_name_en.localeCompare(b.trade_name_en),
    };
    const sponsored = keep.filter((m) => m.sponsored);
    const rest = keep.filter((m) => !m.sponsored).sort(sorter[sort]);
    return [...sponsored, ...rest];
  }, [results, forms, rx, makers, prices, sort]);

  const opts = (values: string[]) => values.map((v) => ({ value: v, label: v }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Dropdown label={t.filters.form} options={opts(unique(results.map((m) => m.dosage_form)))} selected={forms} onToggle={toggle(forms, setForms)} />
          <Dropdown label={t.filters.rx} options={opts(unique(results.map((m) => m.rx_status)))} selected={rx} onToggle={toggle(rx, setRx)} />
          <Dropdown label={t.filters.manufacturer} options={opts(unique(results.map((m) => m.manufacturer)))} selected={makers} onToggle={toggle(makers, setMakers)} />
          <Dropdown
            label={t.filters.price}
            options={t.priceRanges.map((label, i) => ({ value: String(i), label }))}
            selected={prices}
            onToggle={toggle(prices, setPrices)}
          />
        </div>
        <Dropdown
          style="ghost"
          align="end"
          label={`${t.sortLabel}: ${t.sortOptions[sort]}`}
          options={(Object.keys(t.sortOptions) as SortKey[]).map((k) => ({ value: k, label: t.sortOptions[k] }))}
          selected={[sort]}
          onToggle={(v) => setSort(v as SortKey)}
        />
      </div>
      {filtered.length === 0 ? (
        <p className="t-body text-slate">{t.noMatches}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.slice(0, shown).map((m) => (
            <MedicineCard key={m.id} medicine={m} lang={lang} />
          ))}
        </div>
      )}
      {filtered.length > 0 && <p className="t-caption text-slate">{t.vatNote}</p>}
      {shown < filtered.length && (
        <div className="flex justify-center">
          <Button style="secondary" onClick={() => setShown(shown + PAGE_SIZE)}>
            {moreLabel ?? t.showMore}
          </Button>
        </div>
      )}
    </div>
  );
}
