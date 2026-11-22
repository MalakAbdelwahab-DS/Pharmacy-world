import Link from "next/link";

import { Badge, RxBadge } from "@/components/ui";
import type { MedicineCard as Card } from "@/lib/api";
import { dictionaries, type Lang } from "@/lib/i18n";

export const formatPrice = (value: number | null, lang: Lang, digits = 2) =>
  value == null ? null : `${Number(value).toFixed(digits)} ${dictionaries[lang].currency}`;

export const medicineName = (m: Card, lang: Lang) => (lang === "ar" && m.trade_name_ar ? m.trade_name_ar : m.trade_name_en);

// Figma "Medicine card".
// Results variant: 1px border, radius 12. Alternative variant: no border, radius 24, card shadow, type badge on top.
export function MedicineCard({
  medicine: m,
  lang,
  type,
}: {
  medicine: Card;
  lang: Lang;
  type?: "exact" | "related";
}) {
  const t = dictionaries[lang];
  const frame = type
    ? "rounded-lg shadow-[var(--shadow-card)]"
    : "rounded-md border border-border";

  return (
    <Link href={`/${lang}/medicine/?id=${m.id}`} className={`bg-white ${frame} p-4 flex flex-col gap-2 h-full hover:ring-2 hover:ring-tint-blue`}>
      {(type || m.sponsored) && (
        <div className="flex gap-2">
          {type === "exact" && <Badge tone="exact">{t.exactBadge}</Badge>}
          {type === "related" && <Badge tone="related">{t.relatedBadge}</Badge>}
          {m.sponsored && <Badge tone="grey">{t.sponsored}</Badge>}
        </div>
      )}
      <div className="flex items-center gap-2">
        <h3 className="flex-1 min-w-0 t-h3 text-ink">{medicineName(m, lang)}</h3>
        <RxBadge status={m.rx_status} />
      </div>
      <p className="t-body text-ink">
        <bdi dir="ltr">
          {m.ingredients} {m.strength_text}
        </bdi>
      </p>
      <p className="t-body-sm text-slate">
        <bdi>{m.dosage_form}</bdi> · <bdi>{m.manufacturer ?? "—"}</bdi>
      </p>
      <div className="mt-auto pt-2 flex items-center gap-2">
        <div className="flex-1">
          {m.from_price != null && (
            <>
              <p className="t-label text-ink">
                {t.from} {formatPrice(m.from_price, lang)}
              </p>
              {m.price_per_unit != null && (
                <p className="t-caption text-slate">
                  {formatPrice(m.price_per_unit, lang)} {t.per} <bdi>{m.unit_name}</bdi>
                </p>
              )}
            </>
          )}
        </div>
        <span className="t-label text-blue">{t.compare}</span>
      </div>
    </Link>
  );
}
