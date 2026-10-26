import type { ReactNode } from "react";

export type BadgeTone = "default" | "coral" | "purple" | "cloud";

type BadgeProps = {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
};

/* Badge uit de referentie (.badge, .badge-coral, .badge-purple, .badge-cloud). */
export function Badge({ tone = "default", className, children }: BadgeProps) {
  return (
    <span className={["badge", tone === "default" ? "" : `badge-${tone}`, className ?? ""].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}
