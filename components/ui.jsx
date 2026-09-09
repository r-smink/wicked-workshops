"use client";

import { tokens } from "@/lib/tokens";
import { P } from "@/lib/icons";

export function Icon({ name, size = 20, fill = false, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth={fill ? 0 : 1.7} strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true" style={style}>
      <path d={P[name] || P.spark} />
    </svg>
  );
}

export function Star({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={tokens.color.sun} aria-hidden="true">
      <path d="M12 2.4l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.3l-5.9 3.1 1.2-6.5L2.5 9.3l6.6-.9 2.9-6z" />
    </svg>
  );
}

/* De WW-mark: een W boven, de gespiegelde W eronder, licht gekanteld */
export function Logo({ size = 32, mono = false }) {
  const top = mono ? "currentColor" : tokens.color.brand;
  const bottom = mono ? "currentColor" : tokens.color.coral;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true"
      style={{ transform: "rotate(-6deg)", flex: "none" }}>
      <path d="M8 8.5L15 26 24 14.5 33 26 40 8.5" stroke={top} strokeWidth="5.4"
        strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 39.5L19 22 28 33.5 37 22" stroke={bottom} strokeWidth="5.4"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const Wordmark = ({ size = 19, light }) => (
  <span className="ww-logo-wm" style={{ fontSize: size, color: light ? "#fff" : undefined }}>
    <b style={light ? { color: "#fff" } : undefined}>wicked</b> workshops
  </span>
);

/* ===========================================================================
   Primitieven
   =========================================================================== */
export const Button = ({ variant = "primary", size, block, icon, iconRight, children, ...rest }) => (
  <button
    className={`ww-btn ww-btn--${variant}${block ? " ww-btn--block" : ""}${size ? ` ww-btn--${size}` : ""}`}
    {...rest}>
    {icon && <Icon name={icon} size={size === "sm" ? 16 : 18} />}
    {children}
    {iconRight && <Icon name={iconRight} size={16} />}
  </button>
);

export const Chip = ({ on, soft, children, ...rest }) => (
  <button className={`ww-chip${soft ? " ww-chip--soft" : ""}`} data-on={on ? "true" : "false"} {...rest}>
    {children}
  </button>
);

export const BADGE = {
  top_rated: ["ww-badge--top", "Topbeoordeeld"],
  new: ["ww-badge--new", "Nieuw"],
  almost_full: ["ww-badge--full", "Bijna vol"],
  verified: ["ww-badge--verified", "Geverifieerd"],
  live: ["ww-badge--live", "Gepubliceerd"],
  draft: ["ww-badge--draft", "Concept"],
  paused: ["ww-badge--paused", "Gepauzeerd"],
};

export const Badge = ({ kind, children }) => {
  const [cls, label] = BADGE[kind] || ["ww-badge--top", children];
  return (
    <span className={`ww-badge ${cls}`}>
      {kind === "verified" && <Icon name="shield" size={13} />}{children || label}
    </span>
  );
};

export const Rating = ({ value, count, size = 15 }) => (
  <span className="ww-rating"><Star size={size} />{String(value).replace(".", ",")}
    {count != null && <span className="ww-count">({count})</span>}</span>
);

export const Photo = ({ icon = "spark", tone, ratio, size = 30, style, children }) => (
  <div className="ww-ph" data-tone={tone} style={{ aspectRatio: ratio, ...style }}>
    <span className="ww-ph-i"><Icon name={icon} size={size} /></span>
    {children}
  </div>
);

export const Avatar = ({ name, size }) => (
  <span className="ww-av" style={size ? { width: size, height: size, fontSize: size * 0.34 } : undefined}>
    {name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
  </span>
);

export const Field = ({ label, hint, children }) => (
  <label className="ww-field"><span>{label}</span>{children}{hint && <p className="ww-hint">{hint}</p>}</label>
);

export const Switch = ({ on, onChange, title, note }) => (
  <div className="ww-switch">
    <span><strong>{title}</strong>{note && <span>{note}</span>}</span>
    <button className="ww-switch-btn" data-on={on ? "true" : "false"} role="switch"
      aria-checked={on} aria-label={title} onClick={() => onChange(!on)}><i /></button>
  </div>
);

export const Optional = () => <span className="ww-opt">optioneel</span>;
