import "server-only";

import { readSingleton } from "@directus/sdk";
import { publicClient } from "./client";
import type { PlatformSetting } from "./types";

/* platform_settings (docs/03, docs/12). Feature flags en drempels. Zonder
   Directus of zonder rij gelden de standaardkeuzes uit docs/12. */

export type PlatformSettings = {
  minHoursDecisionBeforeStart: number;
  enforceMinDecisionLead: boolean;
  reminderHoursBeforeDecision: number[];
  pilotNoPayments: boolean;
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
  return {
    minHoursDecisionBeforeStart: row.min_hours_decision_before_start ?? d.minHoursDecisionBeforeStart,
    enforceMinDecisionLead: row.enforce_min_decision_lead ?? d.enforceMinDecisionLead,
    reminderHoursBeforeDecision: hours,
    pilotNoPayments: row.pilot_no_payments ?? d.pilotNoPayments,
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

export async function getPlatformSettings(): Promise<PlatformSettings> {
  try {
    const row = await publicClient({ revalidate: 300, tags: ["platform_settings"] }).request(readSingleton("platform_settings"));
    return toPlatformSettings(row);
  } catch {
    return DEFAULT_SETTINGS;
  }
}
