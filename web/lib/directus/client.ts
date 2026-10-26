import "server-only";

import { authentication, createDirectus, rest, staticToken, type RestClient } from "@directus/sdk";
import type { Schema } from "./types";

/* Getypte Directus-clients, alleen op de server (docs/01: de browser praat
   niet met Directus, behalve voor uploads).

   publicClient   publieke data (live workshops, categorieen), gecachet met tags
   userClient     ingelogde data, met het token van de gebruiker
   systemClient   beperkte systeemacties (gastaanmelding, mails), met
                  DIRECTUS_STATIC_TOKEN. Nooit voor iets wat een gebruiker
                  zelf mag: dan geldt zijn eigen token en dus zijn rechten. */

export type CacheOptions = { revalidate?: number | false; tags?: string[] };

export function directusUrl(): string {
  const url = (process.env.DIRECTUS_URL || "").replace(/\/$/, "");
  if (!url) throw new Error("DIRECTUS_URL ontbreekt");
  return url;
}

/* Next.js-caching per aanvraag: de SDK geeft de opties door aan fetch. */
function withCache(cache: CacheOptions | undefined) {
  return rest({
    onRequest: (options) => (cache ? { ...options, next: cache } : { ...options, cache: "no-store" }),
  });
}

export function publicClient(cache: CacheOptions = { revalidate: 300, tags: ["directus"] }): RestClient<Schema> {
  return createDirectus<Schema>(directusUrl()).with(withCache(cache));
}

export function userClient(accessToken: string) {
  return createDirectus<Schema>(directusUrl()).with(staticToken(accessToken)).with(withCache(undefined));
}

export function systemClient() {
  const token = process.env.DIRECTUS_STATIC_TOKEN;
  if (!token) throw new Error("DIRECTUS_STATIC_TOKEN ontbreekt");
  return createDirectus<Schema>(directusUrl()).with(staticToken(token)).with(withCache(undefined));
}

/* Voor inloggen en vernieuwen (fase 3). Tokens bewaart de app zelf in
   httpOnly-cookies, niet de SDK. */
export function authClient() {
  return createDirectus<Schema>(directusUrl()).with(authentication("json", { autoRefresh: false })).with(withCache(undefined));
}
