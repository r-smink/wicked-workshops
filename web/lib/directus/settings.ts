import "server-only";

import { readSingleton } from "@directus/sdk";
import { publicClient, systemClient } from "./client";
import type { PlatformSetting } from "./types";

/* platform_settings (docs/03, docs/12). Feature flags en drempels. Zonder
   Directus of zonder rij gelden de standaardkeuzes uit docs/12.

   paymentMode bepaalt of en waar er betaald wordt:
     off      geen betaling, een boeking is meteen bevestigd
     sandbox  OPP-testomgeving, testgeld (de pilot)
     live     echte betalingen via OPP, op zijn vroegst januari 2027 */
export type PaymentMode = "off" | "sandbox" | "live";
const PAYMENT_MODES: PaymentMode[] = ["off", "sandbox", "live"];

export type PlatformSettings = {
  minHoursDecisionBeforeStart: number;
  enforceMinDecisionLead: boolean;
  reminderHoursBeforeDecision: number[];
  pilotNoPayments: boolean;
  paymentMode: PaymentMode;
  requireIbanInPilot: boolean;
  offerMinHoursAhead: number;
  offerExpiresDaysBefore: number;
  features: { authSocial: boolean; venues: boolean };
  paymentProvider: "opp" | "mollie";
  paymentHoldMinutes: number;
  settlementDelayHours: number;
  decisionGraceHours: number;
};

export const DEFAULT_SETTINGS: PlatformSettings = {
  minHoursDecisionBeforeStart: 48,
  enforceMinDecisionLead: false,
  reminderHoursBeforeDecision: [48, 10],
  pilotNoPayments: true,
  paymentMode: "off",
  requireIbanInPilot: false,
  offerMinHoursAhead: 48,
  offerExpiresDaysBefore: 7,
  features: { authSocial: false, venues: false },
  paymentProvider: "opp",
  paymentHoldMinutes: 30,
  settlementDelayHours: 168,
  decisionGraceHours: 12,
};

export function toPlatformSettings(row: Partial<PlatformSetting> | null | undefined): PlatformSettings {
  if (!row) return DEFAULT_SETTINGS;
  const d = DEFAULT_SETTINGS;
  const hours = Array.isArray(row.reminder_hours_before_decision)
    ? row.reminder_hours_before_decision.filter((h): h is number => typeof h === "number")
    : d.reminderHoursBeforeDecision;
  /* Zonder payment_mode (voor migratie 003) geldt de oude schakelaar:
     pilot_no_payments aan is "off", uit is "sandbox". Nooit vanzelf live. */
  const paymentMode: PaymentMode = PAYMENT_MODES.includes(row.payment_mode as PaymentMode)
    ? (row.payment_mode as PaymentMode)
    : row.pilot_no_payments === false ? "sandbox" : d.paymentMode;
  return {
    minHoursDecisionBeforeStart: row.min_hours_decision_before_start ?? d.minHoursDecisionBeforeStart,
    enforceMinDecisionLead: row.enforce_min_decision_lead ?? d.enforceMinDecisionLead,
    reminderHoursBeforeDecision: hours,
    pilotNoPayments: paymentMode === "off",
    paymentMode,
    requireIbanInPilot: row.require_iban_in_pilot ?? d.requireIbanInPilot,
    offerMinHoursAhead: row.offer_min_hours_ahead ?? d.offerMinHoursAhead,
    offerExpiresDaysBefore: row.offer_expires_days_before ?? d.offerExpiresDaysBefore,
    features: {
      authSocial: row.feature_auth_social ?? d.features.authSocial,
      venues: row.feature_venues ?? d.features.venues,
    },
    paymentProvider: row.payment_provider === "mollie" ? "mollie" : d.paymentProvider,
    paymentHoldMinutes: row.payment_hold_minutes ?? d.paymentHoldMinutes,
    settlementDelayHours: row.settlement_delay_hours ?? d.settlementDelayHours,
    decisionGraceHours: row.decision_grace_hours ?? d.decisionGraceHours,
  };
}

/* Standaard: de publieke, gecachte velden (genoeg voor flags en de
   testmodus-melding). Met { fresh: true }: alle velden, ongecacht, met het
   servertoken. Gebruik dat overal waar geld of boekingen van afhangen, zodat
   omzetten in Directus direct werkt. */
export async function getPlatformSettings({ fresh = false }: { fresh?: boolean } = {}): Promise<PlatformSettings> {
  try {
    const client = fresh ? systemClient() : publicClient({ revalidate: 300, tags: ["platform_settings"] });
    const row = await client.request(readSingleton("platform_settings"));
    return toPlatformSettings(row);
  } catch {
    return DEFAULT_SETTINGS;
  }
}
