/* Waar iemand landt na inloggen of bevestigen (docs/04). ?next= alleen als
   het een intern, relatief pad is. Mijn account (ddash-b, fase 4) bestaat nog
   niet; tot dan landt een deelnemer op de homepage. */

export function safeNext(next: string | null | undefined): string | null {
  if (!next || typeof next !== "string") return null;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  if (/[\r\n]/.test(next)) return null;
  return next.slice(0, 500);
}

export const PARTICIPANT_HOME = "/";
export const PROVIDER_HOME = "/dashboard";

export function landingFor({ next, context }: { next?: string | null; context?: string | null }): string {
  return safeNext(next) || (context === "provider" ? PROVIDER_HOME : PARTICIPANT_HOME);
}
