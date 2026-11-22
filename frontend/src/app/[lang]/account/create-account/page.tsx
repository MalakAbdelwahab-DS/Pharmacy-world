import { languages } from "@/lib/i18n";
import { CreateAccountView } from "./CreateAccountView";

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <CreateAccountView lang={lang as "en" | "ar"} />;
}
