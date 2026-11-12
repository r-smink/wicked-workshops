/* CSS-variabelen in style-props, zoals het ontwerp ze gebruikt (style={{ "--r": "3" }}). */
import "react";

declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
