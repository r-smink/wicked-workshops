/* ===========================================================================
   Guards voor route handlers die met het servertoken naar Directus schrijven.

   Het servertoken mag alles. Daarom bepaalt de server zelf wie er schrijft:
   de ingelogde gebruiker uit de cookie, en de workshopgever die bij die
   gebruiker hoort. Een provider-id uit de request body wordt nooit vertrouwd.
   =========================================================================== */

import { NextResponse } from "next/server";
import { getAccessToken, directusMe } from "./auth";
import { directusFetch } from "./directus";

/* De ingelogde Directus-gebruiker, of null. */
export async function currentUser() {
  const token = await getAccessToken();
  return token ? directusMe(token) : null;
}

/* { user, provider } voor de ingelogde workshopgever. provider is null als
   de gebruiker geen workshopgeversprofiel heeft. */
export async function currentProvider() {
  const user = await currentUser();
  if (!user) return { user: null, provider: null };
  const rows = await directusFetch(
    `/items/providers?filter[user][_eq]=${encodeURIComponent(user.id)}&fields=id,status,opp_merchant_uid,opp_merchant_status,opp_merchant_env&limit=1`,
    { noCache: true }
  );
  const provider = Array.isArray(rows) ? rows[0] || null : rows || null;
  return { user, provider };
}

export const unauthorized = () =>
  NextResponse.json({ error: "Log eerst in" }, { status: 401 });

export const forbidden = () =>
  NextResponse.json({ error: "Dit mag je niet aanpassen" }, { status: 403 });
