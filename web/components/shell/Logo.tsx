/* Horizontaal logo uit reference/brand/logo-horizontaal.svg, inline zodat de
   tekst Bricolage Grotesque gebruikt. `onDark` is de witte variant uit de
   footer. De kleuren lopen via CSS-variabelen, zodat de donkere modus werkt. */
type LogoProps = { onDark?: boolean };

export function LogoMark({ onDark = false }: LogoProps) {
  const top = onDark ? "#fff" : "var(--mark-1)";
  const word = onDark ? "#fff" : "var(--text)";
  const wicked = onDark ? "#fff" : "var(--mark-1)";
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="110 955 261 37" className="logo-h" aria-hidden="true" focusable="false">
      <polyline points="112.5,964.19 121.97,974.43 126.23,965.22 134.53,971.07 137.61,957.46" fill="none" stroke={top} strokeWidth="4.55" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="118.89,988.04 121.97,974.43 130.27,980.28 134.53,971.07 144,981.31" fill="none" stroke="#FF5C6E" strokeWidth="4.55" strokeLinecap="round" strokeLinejoin="round" />
      <text y="979.9" fontSize="21.25" style={{ fontFamily: "var(--font-head)" }}>
        <tspan x="168.3" textLength="76.4" lengthAdjust="spacing" fontWeight="800" fill={wicked}>wicked</tspan>
        <tspan x="250.6" fontWeight="800" fill={word}>workshops</tspan>
      </text>
      <path d="M169.19 988.5 C184.05 985.69 200.86 990.19 216.37 987.38 C229.29 985.69 237.05 986.81 242.87 987.94" fill="none" stroke="#FF5C6E" strokeWidth="2.41" strokeLinecap="round" />
    </svg>
  );
}
