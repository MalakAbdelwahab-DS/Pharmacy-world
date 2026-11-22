import {
  BadgePercent,
  BookOpen,
  Camera,
  Clock,
  Languages,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Quote,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { buttonClass } from "@/components/ui";
import { dictionaries, isLang, languages } from "@/lib/i18n";

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

const whyIcons = [BookOpen, BadgePercent, ShieldCheck, Languages];
const contactIcons = [Phone, MessageCircle, Mail];

// Small gold label above each section title
function Eyebrow({ children, onDark = false }: { children: React.ReactNode; onDark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 t-label ${onDark ? "text-gold" : "text-blue"}`}>
      <span className="h-[3px] w-6 rounded-full bg-gold" aria-hidden />
      {children}
    </span>
  );
}

// Line drawing of the globe from the logo: meridians, parallels and the gold arc of the figure
function GlobeArt({ className = "" }: { className?: string }) {
  const meridians = [0.15, 0.4, 0.65, 0.9];
  const parallels = [-0.6, -0.3, 0, 0.3, 0.6];
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden fill="none">
      <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
      {meridians.map((m) => (
        <ellipse key={m} cx="200" cy="200" rx={150 * m} ry="150" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
      ))}
      {parallels.map((p) => {
        const y = 200 + p * 150;
        const half = Math.sqrt(1 - p * p) * 150;
        return <line key={p} x1={200 - half} x2={200 + half} y1={y} y2={y} stroke="currentColor" strokeWidth="1.2" opacity="0.35" />;
      })}
      <path d="M262 64 C 380 120, 392 300, 250 352" stroke="var(--color-gold)" strokeWidth="22" strokeLinecap="round" />
      <circle cx="300" cy="96" r="20" fill="var(--color-gold)" />
    </svg>
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
  const t = dictionaries[lang];
  const a = t.about;

  return (
    <div className="flex flex-col pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute -top-40 -end-40 size-[520px] rounded-full bg-blue opacity-60 blur-3xl" aria-hidden />
        <GlobeArt className="hidden md:block absolute -bottom-24 -end-10 md:w-[440px] lg:w-[500px] text-white opacity-90 rtl:-scale-x-100" />
        <div className="page relative pt-20 pb-40 md:pt-28 md:pb-48">
          <div className="max-w-[640px] flex flex-col gap-6">
            <Eyebrow onDark>{a.eyebrow}</Eyebrow>
            <h1 className="t-display">{a.heroTitle}</h1>
            <p className="t-body text-white/80 max-w-[560px]">{a.heroText}</p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a href="#branches" className={buttonClass("primary", "bg-gold text-navy")}>
                <MapPin size={18} strokeWidth={2} aria-hidden />
                {a.heroPrimary}
              </a>
              <Link href={`/${lang}/`} className={buttonClass("ghost", "text-white border-[1.5px] border-white/40")}>
                {a.heroSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Numbers, overlapping the hero */}
      <section className="page relative -mt-24">
        <dl className="bg-white rounded-lg shadow-[var(--shadow-tile)] grid grid-cols-2 lg:grid-cols-4">
          {a.stats.map((s, i) => (
            <div
              key={s.label}
              className={`p-6 md:p-8 flex flex-col gap-1 ${i > 0 ? "lg:border-s border-border" : ""} ${i % 2 === 1 ? "border-s lg:border-s border-border" : ""} ${i > 1 ? "border-t lg:border-t-0 border-border" : ""}`}
            >
              <dt className="order-2 t-body-sm text-slate">{s.label}</dt>
              <dd className="order-1 text-[26px] leading-[34px] md:text-[36px] md:leading-[44px] font-semibold text-blue break-words">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Story */}
      <section className="page pt-24 grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-5">
          <Eyebrow>{a.storyEyebrow}</Eyebrow>
          <h2 className="t-h2 md:text-[32px] md:leading-[40px] text-ink">{a.storyTitle}</h2>
          {a.storyText.map((p) => (
            <p key={p} className="t-body text-slate">
              {p}
            </p>
          ))}
        </div>
        <div className="relative pb-10 lg:pb-0">
          <PhotoSlot label={a.storyPhoto} className="aspect-[4/3] lg:aspect-[5/4]" />
          <figure className="absolute -bottom-2 start-6 lg:-bottom-8 lg:-start-8 max-w-[300px] bg-gold text-navy rounded-md p-6 shadow-[var(--shadow-float)] flex flex-col gap-2">
            <Quote size={22} strokeWidth={2} className="rtl:-scale-x-100" aria-hidden />
            <blockquote className="t-h3 font-semibold">{a.storyQuote}</blockquote>
            <figcaption className="t-body-sm text-navy/80">{a.storyQuoteText}</figcaption>
          </figure>
        </div>
      </section>

      {/* Why we built it */}
      <section className="mt-24 bg-white">
        <div className="page py-20 flex flex-col gap-10">
          <div className="flex flex-col items-center text-center gap-3">
            <Eyebrow>{a.whyEyebrow}</Eyebrow>
            <h2 className="t-h2 md:text-[32px] md:leading-[40px] text-ink">{a.whyTitle}</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {a.whyItems.map((item, i) => {
              const Icon = whyIcons[i];
              return (
                <div
                  key={item.title}
                  className="group relative overflow-hidden rounded-lg bg-mist p-8 flex flex-col gap-3 transition duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-tile)]"
                >
                  <span className="absolute top-4 end-6 text-[56px] leading-none font-semibold text-tint-blue" aria-hidden>
                    0{i + 1}
                  </span>
                  <span className="relative size-12 rounded-full bg-blue text-white flex items-center justify-center group-hover:bg-gold group-hover:text-navy transition-colors">
                    <Icon size={22} strokeWidth={1.8} aria-hidden />
                  </span>
                  <h3 className="relative t-h3 text-ink pt-2">{item.title}</h3>
                  <p className="relative t-body-sm text-slate">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="page pt-24 flex flex-col gap-10">
        <div className="flex flex-col items-center text-center gap-3">
          <Eyebrow>{a.foundersEyebrow}</Eyebrow>
          <h2 className="t-h2 md:text-[32px] md:leading-[40px] text-ink">{a.foundersTitle}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 max-w-[960px] w-full mx-auto">
          {a.founders.map((f, i) => (
            <article key={i} className="bg-white rounded-lg shadow-[var(--shadow-tile)] p-8 flex flex-col sm:flex-row gap-6 items-start">
              <span className="relative shrink-0 size-24 rounded-full bg-gradient-to-br from-blue to-navy text-white/80 flex items-center justify-center ring-4 ring-gold ring-offset-4 ring-offset-white">
                <UserRound size={40} strokeWidth={1.4} aria-hidden />
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="t-h3 text-ink">{f.name}</h3>
                <p className="t-label text-blue">{f.role}</p>
                <p className="t-body-sm text-slate pt-2">{f.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Branches */}
      <section id="branches" className="page pt-24 flex flex-col gap-10 scroll-mt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-3">
            <Eyebrow>{a.branchesEyebrow}</Eyebrow>
            <h2 className="t-h2 md:text-[32px] md:leading-[40px] text-ink">{a.branchesTitle}</h2>
          </div>
          <p className="t-body text-slate">{a.branchesText}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {a.branches.map((b, i) => (
            <article key={i} className="bg-white rounded-lg shadow-[var(--shadow-tile)] overflow-hidden flex flex-col">
              {/* Map area: a simple street-grid pattern until a real map is added */}
              <div
                className="relative h-40 bg-tint-blue"
                style={{
                  backgroundImage:
                    "linear-gradient(var(--color-white) 2px, transparent 2px), linear-gradient(90deg, var(--color-white) 2px, transparent 2px)",
                  backgroundSize: "36px 36px",
                }}
              >
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="size-14 rounded-full bg-white shadow-[var(--shadow-float)] flex items-center justify-center text-blue">
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
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="page pt-24">
        <div className="relative overflow-hidden rounded-lg bg-navy text-white p-8 md:p-14">
          <GlobeArt className="absolute -top-28 -end-28 w-[360px] text-white opacity-25 rtl:-scale-x-100" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div className="flex flex-col gap-3">
              <h2 className="t-h2 md:text-[32px] md:leading-[40px]">{a.contactTitle}</h2>
              <p className="t-body text-white/80">{a.contactText}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {a.contactItems.map((c, i) => {
                const Icon = contactIcons[i];
                return (
                  <div key={c.label} className="rounded-md bg-white/10 border border-white/15 p-5 flex flex-col gap-3">
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
        </div>
      </section>
    </div>
  );
}
