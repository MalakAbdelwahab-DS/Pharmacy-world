"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { formatPrice, medicineName } from "@/components/MedicineCard";
import { Badge, buttonClass, RxBadge } from "@/components/ui";
import { api, type MedicineDetail } from "@/lib/api";
import { dictionaries, type Lang } from "@/lib/i18n";
import { useApp } from "@/lib/store";

// Figma "Compare / Desktop / EN" (89:240): white tile, label column + up to 3 medicine columns, "Lowest" badge
function Compare({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const router = useRouter();
  const { compare, toggleCompare } = useApp();
  const param = useSearchParams().get("ids");
  const ids = (param ? param.split(",") : compare.map(String)).filter(Boolean).slice(0, 3);
  const [meds, setMeds] = useState<MedicineDetail[] | null>(null);
  const key = ids.join(",");

  useEffect(() => {
    if (!key) {
      setMeds([]);
      return;
    }
    Promise.all(key.split(",").map((id) => api.medicine(id).catch(() => null))).then((list) =>
      setMeds(list.filter((m): m is MedicineDetail => !!m)),
    );
  }, [key]);

  const remove = (id: number) => {
    if (compare.includes(id)) toggleCompare(id);
    const rest = ids.filter((x) => x !== String(id));
    router.replace(`/${lang}/compare/?ids=${rest.join(",")}`);
  };

  const units = (meds ?? []).map((m) => m.price_per_unit).filter((v): v is number => v != null);
  const lowest = units.length > 1 ? Math.min(...units) : null;

  const rows: { label: string; value: (m: MedicineDetail) => React.ReactNode }[] = [
    { label: t.compareRows.ingredient, value: (m) => <bdi dir="ltr">{m.ingredients} {m.strength_text}</bdi> },
    { label: t.compareRows.form, value: (m) => <bdi>{m.dosage_form}</bdi> },
    { label: t.compareRows.packs, value: (m) => <bdi>{m.packs.map((p) => p.pack_size_text).join(" · ")}</bdi> },
    { label: t.compareRows.price, value: (m) => (m.from_price != null ? `${t.from} ${formatPrice(m.from_price, lang)}` : "—") },
    {
      label: t.compareRows.unit,
      value: (m) =>
        m.price_per_unit == null ? (
          "—"
        ) : (
          <span className={`flex flex-wrap items-center gap-2 t-label ${m.price_per_unit === lowest ? "text-exact" : "text-ink"}`}>
            <span>
              {formatPrice(m.price_per_unit, lang)} {t.per} <bdi>{m.unit_name}</bdi>
            </span>
            {m.price_per_unit === lowest && <Badge tone="exact">{t.lowest}</Badge>}
          </span>
        ),
    },
    { label: t.compareRows.manufacturer, value: (m) => <bdi>{m.manufacturer ?? "—"}</bdi> },
    { label: t.compareRows.country, value: (m) => <bdi>{m.country ?? "—"}</bdi> },
  ];

  return (
    <div className="page pt-8 pb-20 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="t-h2 text-ink">{t.compareTitle}</h1>
        <p className="t-body text-slate">{t.compareSubtitle}</p>
      </div>
      {meds === null ? (
        <p className="t-body text-slate">{t.loading}</p>
      ) : meds.length === 0 ? (
        <p className="t-body text-slate">{t.compareEmpty}</p>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-[var(--shadow-tile)] p-8 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-start">
              <thead>
                <tr className="border-b border-border">
                  <th className="w-[264px]" />
                  {meds.map((m) => (
                    <th key={m.id} className="py-8 pe-4 text-start align-middle font-normal">
                      <div className="flex items-center gap-2">
                        <span className="t-h3 text-ink">{medicineName(m, lang)}</span>
                        <RxBadge status={m.rx_status} />
                        <button type="button" onClick={() => remove(m.id)} aria-label={t.remove} className="ms-auto text-ink">
                          <X size={14} strokeWidth={2} />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-border">
                    <th scope="row" className="py-4 text-start t-label text-slate">{row.label}</th>
                    {meds.map((m) => (
                      <td key={m.id} className="py-4 pe-4 t-body text-ink">{row.value(m)}</td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td />
                  {meds.map((m) => (
                    <td key={m.id} className="pt-6 pe-4">
                      <Link href={`/${lang}/medicine/?id=${m.id}`} className={buttonClass("secondary")}>
                        {t.viewMedicine}
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="t-body-sm text-slate">{t.compareNote}</p>
        </>
      )}
    </div>
  );
}

export function CompareView({ lang }: { lang: Lang }) {
  return (
    <Suspense>
      <Compare lang={lang} />
    </Suspense>
  );
}
