import { Camera, Clock, Mail, MapPin, MessageCircle, Navigation, Phone, Quote, UserRound } from "lucide-react";
import Link from "next/link";

import { FeatureShowcase } from "@/components/about/FeatureShowcase";
import { HeroGlobe } from "@/components/about/HeroGlobe";
import { CountUp, Reveal, Spotlight, Timeline } from "@/components/about/Motion";
import { buttonClass } from "@/components/ui";
import { dictionaries, isLang, languages } from "@/lib/i18n";

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

const contactIcons = [Phone, MessageCircle, Mail];
const sectionTitle = "t-h2 md:text-[32px] md:leading-[40px]";

// Small label with a gold dash above each section title
function Eyebrow({ children, onDark = false }: { children: React.ReactNode; onDark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 t-label ${onDark ? "text-gold" : "text-blue"}`}>
      <span className="h-[3px] w-6 rounded-full bg-gold" aria-hidden />
      {children}
    </span>
  );
}

// Dashed box that marks where a real photo goes
function PhotoSlot({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-gradient-to-br from-tint-blue to-white border-2 border-dashed border-border-strong flex flex-col items-center justify-center gap-2 text-slate ${className}`}
    >
      <Camera size={28} strokeWidth={1.6} aria-hidden />
      <span className="t-body-sm">{label}</span>
    </div>
  );
}

export default async function About({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) return null;
  const a = dictionaries[lang].about;

  return (
    <div className="flex flex-col pb-24">
      {/* Hero with the interactive globe */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute -top-48 -end-24 size-[640px] rounded-full bg-blue opacity-70 blur-3xl" aria-hidden />
        <div className="absolute -bottom-40 -start-40 size-[420px] rounded-full bg-gold opacity-[0.08] blur-3xl" aria-hidden />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(var(--color-white) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          aria-hidden
        />
        <div className="page relative grid items-center gap-4 pt-8 pb-28 md:pt-10 lg:grid-cols-[1fr_1.1fr] lg:pb-32">
          <div className="flex flex-col gap-6 max-w-[600px]">
            <div className="animate-[fade-up_600ms_ease-out_both]">
              <Eyebrow onDark>{a.eyebrow}</Eyebrow>
            </div>
            <h1 className="t-display md:text-[56px] md:leading-[64px] animate-[fade-up_600ms_120ms_ease-out_both]">{a.heroTitle}</h1>
            <p className="t-body text-white/80 max-w-[540px] animate-[fade-up_600ms_240ms_ease-out_both]">{a.heroText}</p>
            <div className="flex flex-wrap gap-4 pt-2 animate-[fade-up_600ms_360ms_ease-out_both]">
              <a href="#branches" className={buttonClass("primary", "bg-gold text-navy transition-transform hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(236,176,76,0.35)]")}>
                <MapPin size={18} strokeWidth={2} aria-hidden />
                {a.heroPrimary}
              </a>
              <Link href={`/${lang}/`} className={buttonClass("ghost", "text-white border-[1.5px] border-white/40 transition-colors hover:bg-white/10")}>
                {a.heroSecondary}
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[420px] md:max-w-[520px] lg:max-w-none animate-[fade-up_900ms_200ms_ease-out_both]">
            <HeroGlobe label={a.globeLabel} hint={a.globeHint} />
          </div>
        </div>
      </section>

      {/* Numbers, overlapping the hero */}
      <section className="page relative -mt-20">
        <dl className="bg-white rounded-lg shadow-[var(--shadow-tile)] grid grid-cols-2 lg:grid-cols-4">
          {a.stats.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 100}
              className={`p-6 md:p-8 flex flex-col gap-1 ${i % 2 === 1 ? "border-s border-border" : ""} ${i === 2 ? "lg:border-s" : ""} ${i > 1 ? "border-t lg:border-t-0 border-border" : ""}`}
            >
              <dd className="text-[26px] leading-[34px] md:text-[40px] md:leading-[48px] font-semibold text-blue break-words">
                <CountUp value={s.value} />
              </dd>
              <dt className="t-body-sm text-slate">{s.label}</dt>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* Story and timeline */}
      <section className="page pt-24 flex flex-col gap-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal className="flex flex-col gap-5">
            <Eyebrow>{a.storyEyebrow}</Eyebrow>
            <h2 className={`${sectionTitle} text-ink`}>{a.storyTitle}</h2>
            {a.storyText.map((p) => (
              <p key={p} className="t-body text-slate">
                {p}
              </p>
            ))}
          </Reveal>
          <Reveal delay={150} className="relative pb-10 lg:pb-0">
            <PhotoSlot label={a.storyPhoto} className="aspect-[4/3] lg:aspect-[5/4]" />
            <figure className="absolute -bottom-2 start-6 lg:-bottom-8 lg:-start-8 max-w-[300px] bg-gold text-navy rounded-md p-6 shadow-[var(--shadow-float)] flex flex-col gap-2 animate-[float_5s_ease-in-out_infinite]">
              <Quote size={22} strokeWidth={2} className="rtl:-scale-x-100" aria-hidden />
              <blockquote className="t-h3 font-semibold">{a.storyQuote}</blockquote>
              <figcaption className="t-body-sm text-navy/80">{a.storyQuoteText}</figcaption>
            </figure>
          </Reveal>
        </div>
        <Reveal>
          <Timeline items={a.timeline} />
        </Reveal>
      </section>

      {/* Why we built it: interactive showcase */}
      <section className="mt-24 bg-gradient-to-b from-tint-blue/70 to-mist">
        <div className="page py-20 flex flex-col gap-12">
          <Reveal className="flex flex-col items-center text-center gap-3">
            <Eyebrow>{a.whyEyebrow}</Eyebrow>
            <h2 className={`${sectionTitle} text-ink`}>{a.whyTitle}</h2>
          </Reveal>
          <Reveal delay={100}>
            <FeatureShowcase items={a.whyItems} demo={a.demo} />
          </Reveal>
        </div>
      </section>

      {/* Founders */}
      <section className="page pt-24 flex flex-col gap-10">
        <Reveal className="flex flex-col items-center text-center gap-3">
          <Eyebrow>{a.foundersEyebrow}</Eyebrow>
          <h2 className={`${sectionTitle} text-ink`}>{a.foundersTitle}</h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2 max-w-[960px] w-full mx-auto">
          {a.founders.map((f, i) => (
            <Reveal key={i} delay={i * 150}>
              <article className="group h-full bg-white rounded-lg shadow-[var(--shadow-tile)] p-8 flex flex-col sm:flex-row gap-6 items-start transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(20,33,61,0.12)]">
                <span className="relative shrink-0 size-24 rounded-full bg-gradient-to-br from-blue to-navy text-white/80 flex items-center justify-center ring-4 ring-gold ring-offset-4 ring-offset-white transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-105">
                  <UserRound size={40} strokeWidth={1.4} aria-hidden />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="t-h3 text-ink">{f.name}</h3>
                  <p className="t-label text-blue">{f.role}</p>
                  <p className="t-body-sm text-slate pt-2">{f.bio}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Branches */}
      <section id="branches" className="page pt-24 flex flex-col gap-10 scroll-mt-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-3">
            <Eyebrow>{a.branchesEyebrow}</Eyebrow>
            <h2 className={`${sectionTitle} text-ink`}>{a.branchesTitle}</h2>
          </div>
          <p className="t-body text-slate">{a.branchesText}</p>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {a.branches.map((b, i) => (
            <Reveal key={i} delay={i * 120}>
              <article className="group h-full bg-white rounded-lg shadow-[var(--shadow-tile)] overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(20,33,61,0.12)]">
                {/* Map area: a street-grid pattern until a real map is added */}
                <div
                  className="relative h-40 bg-tint-blue transition-[background-size] duration-500 [background-size:36px_36px] group-hover:[background-size:42px_42px]"
                  style={{
                    backgroundImage:
                      "linear-gradient(var(--color-white) 2px, transparent 2px), linear-gradient(90deg, var(--color-white) 2px, transparent 2px)",
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="absolute size-14 rounded-full bg-gold/30 animate-[ping-soft_2s_ease-out_infinite]" aria-hidden />
                    <span className="relative size-14 rounded-full bg-white shadow-[var(--shadow-float)] flex items-center justify-center text-blue transition-transform duration-300 group-hover:-translate-y-2">
                      <MapPin size={26} strokeWidth={2} fill="var(--color-gold)" aria-hidden />
                    </span>
                  </span>
                </div>
                <div className="p-6 flex flex-col gap-4 flex-1">
                  <div>
                    <h3 className="t-h3 text-ink">{b.name}</h3>
                    <p className="t-body-sm text-slate">{b.area}</p>
                  </div>
                  <ul className="flex flex-col gap-2 t-body-sm text-ink">
                    <li className="flex items-center gap-2">
                      <Clock size={16} className="text-blue shrink-0" aria-hidden />
                      {b.hours}
                    </li>
                    <li className="flex items-center gap-2">
                      <Phone size={16} className="text-blue shrink-0" aria-hidden />
                      {b.phone}
                    </li>
                  </ul>
                  <div className="mt-auto flex gap-3 pt-2">
                    <span className={buttonClass("secondary", "flex-1 px-4")}>
                      <Navigation size={16} aria-hidden />
                      {a.directions}
                    </span>
                    <span className={buttonClass("primary", "flex-1 px-4")}>
                      <Phone size={16} aria-hidden />
                      {a.call}
                    </span>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Contact, with a gold light that follows the cursor */}
      <section className="page pt-24">
        <Reveal>
          <Spotlight className="rounded-lg bg-navy text-white p-8 md:p-14">
            <div className="relative grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
              <div className="flex flex-col gap-3">
                <h2 className={sectionTitle}>{a.contactTitle}</h2>
                <p className="t-body text-white/80">{a.contactText}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {a.contactItems.map((c, i) => {
                  const Icon = contactIcons[i];
                  return (
                    <div
                      key={c.label}
                      className="rounded-md bg-white/10 border border-white/15 p-5 flex flex-col gap-3 transition-all duration-300 hover:bg-white/15 hover:-translate-y-1"
                    >
                      <span className="size-10 rounded-full bg-gold text-navy flex items-center justify-center">
                        <Icon size={18} strokeWidth={2} aria-hidden />
                      </span>
                      <div>
                        <p className="t-caption text-white/70">{c.label}</p>
                        <p className="t-label break-words">{c.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="relative mt-8 pt-6 border-t border-white/15 t-body-sm text-white/80">{a.contactNote}</p>
          </Spotlight>
        </Reveal>
      </section>
    </div>
  );
}
