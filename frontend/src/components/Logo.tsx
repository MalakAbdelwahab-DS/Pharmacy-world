import Link from "next/link";

import { dictionaries, type Lang } from "@/lib/i18n";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Figma "Logo": 40 x 36 crop of the logo (globe and figure) + "Pharmacy World" in H3, navy, 8px gap
export function Logo({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  return (
    <Link href={`/${lang}/`} className="flex items-center gap-2 shrink-0">
      <span className="relative block w-10 h-9 rounded-[50px] overflow-hidden shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${basePath}/logo.png`}
          alt=""
          className="absolute max-w-none"
          style={{ width: "132.53%", height: "149.55%", left: "-16.47%", top: "-2.7%" }}
        />
      </span>
      <span className="t-h3 text-navy whitespace-nowrap">{t.brand}</span>
    </Link>
  );
}
