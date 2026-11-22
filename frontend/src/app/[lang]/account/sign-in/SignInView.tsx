import { AccountForm } from "@/app/[lang]/account/AccountForm";
import type { Lang } from "@/lib/i18n";

export function SignInView({ lang }: { lang: Lang }) {
  return <AccountForm lang={lang} mode="sign-in" />;
}
