"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Button, TextField } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { dictionaries, type Lang } from "@/lib/i18n";
import { useApp } from "@/lib/store";

// Figma "Account / Sign in" (105:2168) and "Account / Create account" (110:2292):
// 396px white tile, 32px padding, 24px gaps, centred with 80px above and below, caption underneath
function Form({ lang, mode }: { lang: Lang; mode: "sign-in" | "create" }) {
  const t = dictionaries[lang];
  const router = useRouter();
  const next = useSearchParams().get("next") ?? `/${lang}/account/saved/`;
  const { signIn } = useApp();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const create = mode === "create";

  const set = (field: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues({ ...values, [field]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const res = create ? await api.register(values) : await api.login(values);
      signIn(res.token, res.user);
      router.push(next);
    } catch (err) {
      const fields = err instanceof ApiError ? (err.detail as { fields?: Record<string, string> })?.fields : null;
      setErrors(fields ?? { password: "wrong" });
    } finally {
      setBusy(false);
    }
  };

  const err = (field: string) => (errors[field] ? t.fieldErrors[errors[field]] ?? t.error : null);
  const keepNext = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div className="page py-20 flex flex-col items-center gap-6">
      <form onSubmit={submit} noValidate className="w-full max-w-[396px] bg-white rounded-lg shadow-[var(--shadow-tile)] p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="t-h1 text-ink">{create ? t.createTitle : t.signInTitle}</h1>
          <p className="t-body text-slate">{t.signInSubtitle}</p>
        </div>
        {create && (
          <TextField label={t.fullName} placeholder={t.namePlaceholder} autoComplete="name" value={values.name} onChange={set("name")} error={err("name")} />
        )}
        <TextField
          label={t.email}
          type="email"
          placeholder={t.emailPlaceholder}
          autoComplete="email"
          dir="ltr"
          value={values.email}
          onChange={set("email")}
          error={err("email")}
        />
        <TextField
          label={t.password}
          type="password"
          placeholder={create ? t.newPasswordPlaceholder : t.passwordPlaceholder}
          autoComplete={create ? "new-password" : "current-password"}
          value={values.password}
          onChange={set("password")}
          error={err("password")}
        />
        {create ? (
          <p className="t-caption text-slate">
            {t.consent}{" "}
            <Link href={`/${lang}/privacy/`} className="text-blue">
              {t.privacyPolicy}
            </Link>
            .
          </p>
        ) : (
          <Link href={`/${lang}/contact/`} className="t-label text-blue self-start">
            {t.forgotPassword}
          </Link>
        )}
        <Button type="submit" style="primary" className="w-full" disabled={busy}>
          {create ? t.createTitle : t.signInTitle}
        </Button>
        <p className="flex flex-wrap gap-1">
          <span className="t-body-sm text-slate">{create ? t.haveAccount : t.newHere}</span>
          <Link href={`/${lang}/account/${create ? "sign-in" : "create-account"}/${keepNext}`} className="t-label text-blue">
            {create ? t.signInTitle : t.createTitle}
          </Link>
        </p>
      </form>
      <p className="t-caption text-slate text-center">{t.noAccountNeeded}</p>
    </div>
  );
}

export function AccountForm({ lang, mode }: { lang: Lang; mode: "sign-in" | "create" }) {
  return (
    <Suspense>
      <Form lang={lang} mode={mode} />
    </Suspense>
  );
}
