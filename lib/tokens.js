/* Design tokens, overgenomen uit de brand guide v1.0.
   Worden ook in de stylesheet (app/globals.css) als CSS-variabelen gezet
   onder de .ww-scope, maar hier beschikbaar voor JS-gebruik (Logo, Star, enz.). */
export const tokens = {
  color: {
    brand: "#6C2BD9", brandDeep: "#5620B0", coral: "#FF5C6E", coralDeep: "#E8394C",
    ink: "#1B1630", slate: "#6E6A85", cloud: "#F1EAFB", mist: "#FBFAFE",
    line: "#E9E3F3", sun: "#FFB020", softCoral: "#FFE7EB", white: "#FFFFFF",
    ok: "#1F9D6B", warn: "#B8791A",
  },
  font: {
    display: "'Bricolage Grotesque', sans-serif",
    body: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  radius: { sm: 12, md: 16, lg: 20, xl: 24, pill: 999 },
  shadow: {
    card: "0 8px 18px rgba(30,20,60,.13)",
    float: "0 10px 26px rgba(30,20,60,.10)",
    lift: "0 18px 40px rgba(30,20,60,.16)",
  },
};
