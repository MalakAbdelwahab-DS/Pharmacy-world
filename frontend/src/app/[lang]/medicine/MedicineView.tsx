"use client";

import { ArrowDownToLine, Factory, Globe, PackageX, Pill } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { formatPrice, MedicineCard, medicineName } from "@/components/MedicineCard";
import { Badge, Button, Chip, RxBadge } from "@/components/ui";
import { api, type Alternatives, type MedicineDetail } from "@/lib/api";
import { dictionaries, type Lang } from "@/lib/i18n";

type TabKey = "alternatives" | "uses" | "dosing" | "warnings" | "side_effects" | "storage";
const clinicalTabs: TabKey[] = ["uses", "dosing", "warnings", "side_effects", "storage"];

const tile = "bg-white rounded-lg shadow-[var(--shadow-tile)]";

// Figma "Medicine page / Desktop / EN" (56:400) and "Medicine page / Discontinued"
function View({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const id = useSearchParams().get("id") ?? "";
  const [m, setM] = useState<MedicineDetail | null>(null);
  const [alts, setAlts] = useState<Alternatives>({ same_medicine: [], similar: [] });
  const [error, setError] = useState(false);
  const [pack, setPack] = useState(0);
  const discontinued = m?.status === "discontinued";
  const [tab, setTab] = useState<TabKey>("alternatives");

  useEffect(() => {
    if (!id) return;
    setM(null);
    setPack(0);
    api.medicine(id).then(setM).catch(() => setError(true));
    api.alternatives(id).then(setAlts).catch(() => setAlts({ same_medicine: [], similar: [] }));
  }, [id]);

  useEffect(() => {
    setTab(discontinued ? "uses" : "alternatives");
  }, [discontinued]);

  if (error) return <p className="page t-body text-danger py-10">{t.notFound}</p>;
  if (!m) return <p className="page t-body text-slate py-10">{t.loading}</p>;

  const name = medicineName(m, lang);
  const packs = m.packs.filter((p) => p.public_price != null);
  const selected = packs[pack];
  const hasLowerPrice = alts.same_medicine.some((a) => a.lower_price);
  const tabs: TabKey[] = discontinued ? clinicalTabs : ["alternatives", ...clinicalTabs];
  const altCount = alts.same_medicine.length + alts.similar.length;

  const alternatives = (
    <div id="alternatives" className="flex flex-col gap-8 pt-6">
      {altCount === 0 && <p className="t-body text-slate">{t.noAlternatives}</p>}
      {alts.same_medicine.length > 0 && (
        <AltGroup title={`${t.exactAlternatives} (${alts.same_medicine.length})`} help={t.exactHelp}>
          {alts.same_medicine.map((a) => (
            <MedicineCard key={a.id} medicine={a} lang={lang} type="exact" />
          ))}
        </AltGroup>
      )}
      {alts.similar.length > 0 && (
        <AltGroup title={`${t.relatedAlternatives} (${alts.similar.length})`} help={t.relatedHelp}>
          {alts.similar.map((a) => (
            <MedicineCard key={a.id} medicine={a} lang={lang} type="related" />
          ))}
        </AltGroup>
      )}
    </div>
  );

  return (
    <div className="page pt-2 pb-20 flex flex-col gap-6">
      <p className="t-caption text-slate whitespace-pre">
        <Link href={`/${lang}/`}>{t.home}</Link>
        {"   ›   "}
        {m.therapeutic_class && (
          <>
            <bdi>{m.therapeutic_class}</bdi>
            {"   ›   "}
          </>
        )}
        <bdi>{name}</bdi>
      </p>

      {discontinued && (
        <div className="bg-tint-grey rounded-md px-6 py-4 flex items-center gap-3">
          <PackageX size={24} strokeWidth={1.8} className="text-discontinued shrink-0" aria-hidden />
          <div className="flex flex-col gap-1">
            <p className="t-label text-ink">{t.noLongerAvailable}</p>
            <p className="t-body-sm text-slate">{t.noLongerAvailableHelp}</p>
          </div>
        </div>
      )}

      {/* Bento row: medicine tile + 380px price tile */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        <section className={`${tile} flex-1 min-w-0 p-8 flex flex-col md:flex-row md:items-center gap-8`}>
          <div className="size-[240px] shrink-0 rounded-lg bg-tint-blue flex flex-col items-center justify-center gap-2">
            <Pill size={64} strokeWidth={1.8} className="text-blue" aria-hidden />
            <span className="t-caption text-slate">{t.packPhoto}</span>
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-3 items-start">
            <div className="flex gap-2">
              <RxBadge status={m.rx_status} />
              {discontinued && <Badge tone="grey">{t.discontinued}</Badge>}
            </div>
            <h1 className="t-display text-ink">{name}</h1>
            <p className="t-h3 text-blue">
              <bdi dir="ltr">
                {m.ingredients} {m.strength_text}
              </bdi>
            </p>
            <div className="pt-1 flex flex-wrap gap-4 t-body-sm text-slate">
              <Fact icon={<Pill size={18} strokeWidth={1.8} />}><bdi>{m.dosage_form}</bdi></Fact>
              {m.route && <Fact icon={<ArrowDownToLine size={18} strokeWidth={1.8} />}><bdi>{m.route}</bdi></Fact>}
              {m.manufacturer && <Fact icon={<Factory size={18} strokeWidth={1.8} />}><bdi>{m.manufacturer}</bdi></Fact>}
              {m.country && (
                <Fact icon={<Globe size={18} strokeWidth={1.8} />}>
                  {t.madeIn} <bdi>{m.country}</bdi>
                </Fact>
              )}
            </div>
            <div className="pt-2 flex flex-wrap gap-2">
              {m.therapeutic_class && <Chip><bdi>{m.therapeutic_class}</bdi></Chip>}
              {m.atc_code && <Chip><bdi>ATC {m.atc_code}</bdi></Chip>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button style="primary">{t.askAboutMedicine}</Button>
              <Button style="secondary">{t.compare}</Button>
              <Button style="secondary">{t.save}</Button>
            </div>
          </div>
        </section>

        <section className={`${tile} lg:w-[380px] shrink-0 p-8 flex flex-col gap-4 items-start`}>
          {discontinued ? (
            <>
              <p className="t-h2 text-slate">{t.noLongerSold}</p>
              {packs[0] && (
                <p className="t-caption text-slate">
                  {t.lastPrice} {formatPrice(packs[0].public_price, lang)}
                </p>
              )}
              <Button style="primary" onClick={() => document.getElementById("alternatives")?.scrollIntoView({ behavior: "smooth" })}>
                {t.seeAlternatives}
              </Button>
            </>
          ) : (
            <>
              <p className="t-label text-slate">{t.packSize}</p>
              {packs.length > 0 && (
                <div className="bg-mist rounded-full p-1 flex flex-wrap gap-1" role="radiogroup" aria-label={t.packSize}>
                  {packs.map((p, i) => (
                    <button
                      key={p.pack_size_text}
                      type="button"
                      role="radio"
                      aria-checked={i === pack}
                      onClick={() => setPack(i)}
                      className={`px-4 py-2 rounded-full t-label whitespace-nowrap ${
                        i === pack ? "bg-white text-ink shadow-[var(--shadow-segment)]" : "text-slate"
                      }`}
                    >
                      <bdi>{p.pack_size_text}</bdi>
                    </button>
                  ))}
                </div>
              )}
              {selected && (
                <div className="flex flex-col gap-1">
                  <p className="t-display text-ink">{formatPrice(selected.public_price, lang)}</p>
                  <p className="t-body-sm text-slate">
                    {selected.price_per_unit != null && (
                      <>
                        {formatPrice(selected.price_per_unit, lang)} {t.per} <bdi>{selected.unit_name}</bdi> ·{" "}
                      </>
                    )}
                    {t.officialPrice}
                  </p>
                </div>
              )}
              {hasLowerPrice && (
                <button
                  type="button"
                  className="t-label text-exact text-start"
                  onClick={() => {
                    setTab("alternatives");
                    setTimeout(() => document.getElementById("alternatives")?.scrollIntoView({ behavior: "smooth" }));
                  }}
                >
                  {t.sameMedicineLowerPrice}
                </button>
              )}
            </>
          )}
        </section>
      </div>

      {discontinued && alternatives}

      {/* Tabs: active = blue text + 2px blue underline */}
      <div className="pt-6 flex flex-col gap-4">
        <div className="bg-white border-b border-border flex overflow-x-auto" role="tablist">
          {tabs.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`px-4 py-3 t-label whitespace-nowrap border-b-2 ${
                tab === key ? "text-blue border-blue" : "text-slate border-transparent"
              }`}
            >
              {t.tabs[key]}
              {key === "alternatives" && ` (${altCount})`}
            </button>
          ))}
        </div>
        {tab === "alternatives" ? alternatives : <ClinicalSection lang={lang} medicine={m} section={tab} />}
      </div>

      <p className="t-body-sm text-slate text-center">{t.disclaimer}</p>
    </div>
  );
}

function Fact({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1">
      <span aria-hidden className="shrink-0">
        {icon}
      </span>
      {children}
    </span>
  );
}

function AltGroup({ title, help, children }: { title: string; help: string; children: React.ReactNode }) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <h2 className="t-h3 text-ink">{title}</h2>
        <p className="t-body text-slate">{help}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </>
  );
}

function ClinicalSection({ lang, medicine, section }: { lang: Lang; medicine: MedicineDetail; section: TabKey }) {
  const t = dictionaries[lang];
  const data = medicine.clinical_sections.find((s) => s.section === section);
  const content = data && (lang === "ar" ? data.content_ar ?? data.content_en : data.content_en);

  return (
    <div className={`${tile} p-8 flex flex-col gap-3`}>
      {content ? (
        <>
          <p className="t-body text-ink max-w-[760px] whitespace-pre-line">{content}</p>
          <p className="t-caption text-slate">
            {t.reference}: {data.reference} · {t.lastUpdated} {data.last_updated}
          </p>
        </>
      ) : (
        <p className="t-body text-slate">{t.noSectionYet}</p>
      )}
    </div>
  );
}

export function MedicineView({ lang }: { lang: Lang }) {
  return (
    <Suspense>
      <View lang={lang} />
    </Suspense>
  );
}
