"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Badge, MedicineCard, price } from "@/components/MedicineCard";
import { api, type Alternatives, type MedicineDetail } from "@/lib/api";
import { dictionaries, type Lang } from "@/lib/i18n";

function View({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const id = useSearchParams().get("id") ?? "";
  const [m, setM] = useState<MedicineDetail | null>(null);
  const [alts, setAlts] = useState<Alternatives | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.medicine(id).then(setM).catch(() => setError(true));
    api.alternatives(id).then(setAlts).catch(() => setAlts({ same_medicine: [], similar: [] }));
  }, [id]);

  if (error) return <p className="text-danger">{t.notFound}</p>;
  if (!m) return <p className="text-slate">{t.loading}</p>;
  const name = lang === "ar" && m.trade_name_ar ? m.trade_name_ar : m.trade_name_en;
  const discontinued = m.status === "discontinued";

  const alternatives = alts && (
    <>
      {alts.same_medicine.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-semibold">{t.sameMedicine} ({alts.same_medicine.length})</h2>
          <p className="text-slate mt-1 mb-5">{t.sameMedicineHelp}</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {alts.same_medicine.map((a) => <MedicineCard key={a.id} medicine={a} lang={lang} />)}
          </div>
        </section>
      )}
      {alts.similar.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-semibold">{t.similar} ({alts.similar.length})</h2>
          <p className="text-slate mt-1 mb-5">{t.similarHelp}</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {alts.similar.map((a) => <MedicineCard key={a.id} medicine={a} lang={lang} />)}
          </div>
        </section>
      )}
    </>
  );

  return (
    <>
      {discontinued && (
        <div className="bg-tint-grey rounded-md px-6 py-4 mb-6 font-medium">{t.noLongerAvailable}</div>
      )}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="bg-white rounded-lg shadow-[var(--shadow-tile)] p-8">
          <div className="flex gap-2 mb-3">
            {m.rx_status && <Badge>{m.rx_status}</Badge>}
            {discontinued && <Badge tone="grey">{t.discontinued}</Badge>}
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold">{name}</h1>
          <p className="text-xl text-blue mt-2">
            <bdi dir="ltr">{m.ingredients} {m.strength_text}</bdi>
          </p>
          <p className="text-slate mt-3">
            {m.dosage_form} · {m.route} · {t.manufacturer}: {m.manufacturer ?? "—"}
            {m.country && ` · ${t.madeIn} ${m.country}`}
          </p>
        </section>
        <section className="bg-white rounded-lg shadow-[var(--shadow-tile)] p-8">
          <h2 className="text-sm text-slate">{t.packs}</h2>
          <ul className="mt-3 divide-y divide-border">
            {m.packs.map((p) => (
              <li key={p.pack_size_text} className="py-3 flex justify-between gap-4">
                <span>{p.pack_size_text}</span>
                <span className="text-end">
                  <span className="font-semibold block">{price(p.public_price, lang) ?? "—"}</span>
                  {p.price_per_unit != null && (
                    <span className="text-xs text-slate">
                      {price(p.price_per_unit, lang, 3)} {t.per} {p.unit_name}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate mt-3">{t.publicPrice} · {t.priceNote}</p>
        </section>
      </div>
      {alternatives}
      <p className="text-sm text-slate text-center mt-12">{t.disclaimer}</p>
    </>
  );
}

export function MedicineView({ lang }: { lang: Lang }) {
  return (
    <Suspense>
      <View lang={lang} />
    </Suspense>
  );
}
