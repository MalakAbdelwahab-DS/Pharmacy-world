import Link from "next/link";

type ButtonStyle = "primary" | "secondary" | "ghost";

const buttonStyles: Record<ButtonStyle, string> = {
  primary: "bg-blue text-white",
  secondary: "bg-white text-blue border-[1.5px] border-blue",
  ghost: "text-blue",
};

// Figma "Button": 24 x 12 padding, full radius, Label text style
export function buttonClass(style: ButtonStyle = "primary", extra = "") {
  return `inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full t-label whitespace-nowrap shrink-0 ${buttonStyles[style]} ${extra}`;
}

export function Button({
  style = "primary",
  href,
  children,
  className = "",
  ...props
}: { style?: ButtonStyle; href?: string; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  if (href) {
    return (
      <Link href={href} className={buttonClass(style, className)}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={buttonClass(style, className)} {...props}>
      {children}
    </button>
  );
}

type BadgeTone = "otc" | "rx" | "exact" | "related" | "grey";

const badgeTones: Record<BadgeTone, string> = {
  otc: "bg-tint-slate text-ink",
  rx: "bg-navy text-white",
  exact: "bg-tint-green text-exact",
  related: "bg-tint-blue text-blue",
  grey: "bg-tint-grey text-ink",
};

// Figma "Badge": 12 x 4 padding, full radius, Label text style
export function Badge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  return <span className={`inline-flex items-center px-3 py-1 rounded-full t-label whitespace-nowrap shrink-0 ${badgeTones[tone]}`}>{children}</span>;
}

export function RxBadge({ status }: { status: "Rx" | "OTC" | null }) {
  if (!status) return null;
  return <Badge tone={status === "Rx" ? "rx" : "otc"}>{status}</Badge>;
}

// Figma "Link chip"
export function Chip({ href, children }: { href?: string; children: React.ReactNode }) {
  const cls = "inline-flex items-center px-3 py-1 rounded-full bg-tint-blue text-blue t-label whitespace-nowrap";
  return href ? <Link href={href} className={cls}>{children}</Link> : <span className={cls}>{children}</span>;
}

// Figma "Text field": Label (14 medium) + 48px field, 1px border-strong, radius 12; Focus = 2px blue; Error = 2px danger + caption
export function TextField({
  label,
  error,
  ...props
}: { label: string; error?: string | null } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-2 w-full">
      <span className="t-label text-ink">{label}</span>
      <input
        {...props}
        aria-invalid={!!error}
        className={`h-12 px-4 rounded-md bg-white t-body text-ink placeholder:text-slate outline-none ${
          error ? "border-2 border-danger" : "border border-border-strong focus:border-2 focus:border-blue"
        }`}
      />
      {error && <span className="t-caption text-danger">{error}</span>}
    </label>
  );
}

// Figma "Tab": 16 x 12 padding, Label; active = blue text + 2px blue underline
export function TabLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`px-4 py-3 t-label whitespace-nowrap border-b-2 ${active ? "text-blue border-blue" : "text-slate border-transparent"}`}
    >
      {children}
    </Link>
  );
}

// Tile used by the browse pages (category, condition)
export function BrowseTile({ href, title, examples, count }: { href: string; title: string; examples: string; count: string }) {
  return (
    <Link href={href} className="bg-white rounded-lg shadow-[var(--shadow-tile)] p-6 flex flex-col gap-2 hover:ring-2 hover:ring-tint-blue">
      <h3 className="t-h3 text-ink">{title}</h3>
      <p className="t-body-sm text-slate">{examples}</p>
      <span className="mt-auto pt-2 t-label text-blue">{count}</span>
    </Link>
  );
}

// Page intro used by browse pages: breadcrumb, H1 title, description
export function Intro({ crumbs, title, text }: { crumbs: { label: string; href?: string }[]; title: string; text?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="t-caption text-slate">
        {crumbs.map((c, i) => (
          <span key={c.label}>
            {i > 0 && <span className="mx-2">›</span>}
            {c.href ? <Link href={c.href}>{c.label}</Link> : <bdi>{c.label}</bdi>}
          </span>
        ))}
      </p>
      <h1 className="t-h1 text-ink">{title}</h1>
      {text && <p className="t-body text-slate">{text}</p>}
    </div>
  );
}
