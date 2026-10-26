import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

/* Knop uit de referentie (.btn). Paars is de standaard; .btn-coral is in het
   ontwerp bewust ook paars (wit op coral haalt geen AA), dus die variant
   bestaat hier niet apart. */
export type ButtonVariant = "primary" | "line" | "on-band";
export type ButtonSize = "md" | "sm";

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

export function buttonClass({ variant = "primary", size = "md", className }: Omit<Common, "children">): string {
  return [
    "btn",
    variant === "line" ? "btn-line" : "",
    variant === "on-band" ? "btn-on-band" : "",
    size === "sm" ? "btn-sm" : "",
    className ?? "",
  ].filter(Boolean).join(" ");
}

type ButtonProps = Common & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export function Button({ variant, size, className, children, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonClass({ variant, size, className })} {...rest}>
      {children}
    </button>
  );
}

type ButtonLinkProps = Common & { href: string } & Omit<ComponentPropsWithoutRef<"a">, "className" | "children" | "href">;

export function ButtonLink({ variant, size, className, children, href, ...rest }: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClass({ variant, size, className })} {...rest}>
      {children}
    </Link>
  );
}
