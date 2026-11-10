/* Eenvoudige rate limiting in het geheugen: per sleutel (IP of adres) een
   maximum aantal pogingen per venster. Op Vercel heeft elke instantie zijn
   eigen geheugen, dus dit remt misbruik af maar is geen harde grens. Voor
   echt geld (2027) vervangen door een gedeelde opslag (Upstash, Vercel KV). */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function hit(key: string, { limit, windowMs, now = Date.now() }: { limit: number; windowMs: number; now?: number }): boolean {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 5000) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    }
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

/* Alle sleutels moeten binnen hun limiet blijven. */
export function allowed(keys: string[], opts: { limit: number; windowMs: number; now?: number }): boolean {
  let ok = true;
  for (const key of keys) if (!hit(key, opts)) ok = false;
  return ok;
}

export function clientIp(headers: Headers): string {
  return (headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || headers.get("x-real-ip") || "onbekend";
}

/* Antwoord niet sneller dan minMs, zodat de responstijd niet verraadt of
   een adres bestaat (docs/04). */
export async function atLeast<T>(minMs: number, work: Promise<T>): Promise<T> {
  const [result] = await Promise.all([work, new Promise((r) => setTimeout(r, minMs))]);
  return result;
}

export function resetRateLimits() {
  buckets.clear();
}
