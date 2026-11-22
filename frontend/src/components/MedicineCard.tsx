import Link from "next/link";

import type { MedicineCard as Card } from "@/lib/api";
import { dictionaries, type Lang } from "@/lib/i18n";

export function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "blue" | "green" | "grey" }) {
  const tones = {
    slate: "bg-tint-slate text-ink",
    blue: "bg-tint-blue text-blue",
    green: "bg-tint-green text-exact",
    grey: "bg-tint-grey text-ink",
  };
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export const price = (value: number | null, lang: Lang, digits = 2) =>
  value == null ? null : `${value.toFixed(digits)} ${dictionaries[lang].currency}`;

export function MedicineCard({ medicine: m, lang }: { medicine: Card; lang: Lang }) {
  const t = dictionaries[lang];
  const name = lang === "ar" && m.trade_name_ar ? m.trade_name_ar : m.trade_name_en;

  return (
    <Link
      href={`/${lang}/medicine/?id=${m.id}`}
      className="block bg-white rounded-lg shadow-[var(--shadow-tile)] p-5 hover:ring-2 hover:ring-tint-blue"
    >
      <div className="flex flex-wrap gap-2 mb-2">
        {m.sponsored && <Badge tone="grey">{t.sponsored}</Badge>}
        {m.lower_price && <Badge tone="green">{t.lowerPrice}</Badge>}
        {m.status === "discontinued" && <Badge tone="grey">{t.discontinued}</Badge>}
      </div>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold">{name}</h3>
        {m.rx_status && <Badge>{m.rx_status}</Badge>}
      </div>
      <p className="mt-1">
        <bdi dir="ltr">{m.ingredients} {m.strength_text}</bdi>
      </p>
      <p className="text-sm text-slate mt-1">
        {m.dosage_form} · {t.manufacturer}: {m.manufacturer ?? "—"}
      </p>
      {m.from_price != null && (
        <div className="mt-4">
          <p className="text-sm font-semibold">
            {t.publicPrice}: {t.from} {price(m.from_price, lang)}
          </p>
          {m.price_per_unit != null && (
            <p className="text-xs text-slate">
              {price(m.price_per_unit, lang)} {t.per} {m.unit_name}
            </p>
          )}
        </div>
      )}
    </Link>
  );
}
