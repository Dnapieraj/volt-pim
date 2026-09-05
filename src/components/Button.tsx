import Link from "next/link";

const variants = {
  primary:
    "bg-copper text-on-dark hover:bg-copper-dark focus-visible:outline-copper",
  dark: "bg-ink text-on-dark hover:bg-copper-dark focus-visible:outline-ink",
  ghost:
    "border border-ink/40 bg-paper text-ink hover:border-ink hover:bg-card focus-visible:outline-ink",
} as const;

type Variant = keyof typeof variants;

type Common = {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
};

const base =
  "inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

function classes(variant: Variant, className: string) {
  return `${base} ${variants[variant]} ${className}`.trim();
}

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  onClick,
  disabled,
}: Common & {
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes(variant, className)}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  href,
  variant = "primary",
  className = "",
}: Common & { href: string }) {
  return (
    <Link href={href} className={classes(variant, className)}>
      {children}
    </Link>
  );
}
