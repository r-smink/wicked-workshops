import type { CSSProperties } from "react";
import type { IconName } from "./icon-sprite";

export type { IconName };

type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
  /* Zonder label is het icoon decoratief (aria-hidden). */
  label?: string;
};

/* Icoon uit de sprite (components/ui/icon-sprite.tsx), zoals in de
   referentie: <svg><use href="#i-..."/></svg>. */
export function Icon({ name, size = 19, className, style, label }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      style={style}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      focusable="false"
    >
      <use href={`#i-${name}`} />
    </svg>
  );
}
