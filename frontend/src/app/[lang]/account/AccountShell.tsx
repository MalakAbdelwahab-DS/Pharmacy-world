"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button, TabLink } from "@/components/ui";
import { dictionaries, type Lang } from "@/lib/i18n";
import { useApp } from "@/lib/store";

// Figma "Account / Saved medicines" (110:2336) and "Account / Chat history" (124:2513): title, two tabs, count, content
export function AccountShell({ lang, active, count, children }: { lang: Lang; active: "saved" | "chats"; count: string | null; children: React.ReactNode }) {
  const t = dictionaries[lang];
  const router = useRouter();
  const { user, userLoaded, signOut } = useApp();

  useEffect(() => {
    if (userLoaded && !user) router.replace(`/${lang}/account/sign-in/?next=${encodeURIComponent(`/${lang}/account/${active}/`)}`);
  }, [userLoaded, user, router, lang, active]);

  if (!user) return <p className="page py-10 t-body text-slate">{t.loading}</p>;

  return (
    <div className="page pt-8 pb-20 flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="t-h1 text-ink">{t.myAccount}</h1>
        <Button
          style="ghost"
          onClick={() => {
            signOut();
            router.push(`/${lang}/`);
          }}
        >
          {t.signOut}
        </Button>
      </div>
      <nav className="flex gap-8">
        <TabLink href={`/${lang}/account/saved/`} active={active === "saved"}>
          {t.savedTab}
        </TabLink>
        <TabLink href={`/${lang}/account/chats/`} active={active === "chats"}>
          {t.chatsTab}
        </TabLink>
      </nav>
      {count && <p className="t-body text-slate">{count}</p>}
      {children}
    </div>
  );
}
