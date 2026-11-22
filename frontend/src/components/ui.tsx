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
