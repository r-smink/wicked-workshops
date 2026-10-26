"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

type ChipProps = {
  /* Keuzechip: aan of uit, via aria-pressed (.fchip in de referentie). */
  pressed: boolean;
  onPressedChange?: (pressed: boolean) => void;
  /* Donkere hoofdchip, bijvoorbeeld "Alle filters". */
  main?: boolean;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"button">, "children" | "aria-pressed" | "onClick">;

export function Chip({ pressed, onPressedChange, main = false, className, children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      className={["fchip", main ? "fchip-hoofd" : "", className ?? ""].filter(Boolean).join(" ")}
      aria-pressed={pressed}
      onClick={() => onPressedChange?.(!pressed)}
      {...rest}
    >
      {children}
    </button>
  );
}
