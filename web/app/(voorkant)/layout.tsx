import type { ReactNode } from "react";
import "@/styles/voorkant.css";

/* De voorkant uit wicked-handoff/design. Alleen de stylesheet; kop en voet
   zitten in <PageFrame>, omdat de ontwerp-CSS ze binnen .page verwacht. */
export default function VoorkantLayout({ children }: { children: ReactNode }) {
  return children;
}
